import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

export interface DsSelectAsyncOption<T = unknown> {
  value: T;
  label: string;
  description?: string;
}

@Component({
  selector: 'ds-select-async',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatInputModule],
  templateUrl: './ds-select-async.component.html',
  styleUrl: './ds-select-async.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DsSelectAsyncComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DsSelectAsyncComponent<T = unknown>
  implements ControlValueAccessor, OnInit
{
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error: string | null = null;

  /**
   * Texto a ser exibido quando já há um valor selecionado
   * (ex.: modo edição com responsável definido).
   */
  @Input() initialLabel: string | null = null;

  /**
   * Função de busca que deve ser fornecida pelo container.
   * Recebe o termo digitado e retorna um observable com as opções.
   */
  @Input() searchFn: (term: string) => Observable<DsSelectAsyncOption<T>[]> = () =>
    of([]);

  /**
   * Número mínimo de caracteres antes de disparar a busca.
   */
  @Input() minChars = 2;

  /**
   * Tempo de debounce em ms.
   */
  @Input() debounceMs = 300;

  options: DsSelectAsyncOption<T>[] = [];
  searchTerm = '';

  value: T | null = null;
  disabled = false;
  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  private search$ = new Subject<string>();

  ngOnInit(): void {
    // Carrega opções iniciais ao montar
    this.searchFn('')
      .subscribe(options => {
        this.options = options ?? [];
        this.ensureSelectedOptionPresent();
      });

    // Busca assíncrona conforme o termo digitado no campo de busca interno
    this.search$
      .pipe(
        debounceTime(this.debounceMs),
        distinctUntilChanged(),
        switchMap(term => {
          const trimmed = term.trim();
          if (!trimmed || trimmed.length < this.minChars) {
            return of<DsSelectAsyncOption<T>[]>([]);
          }
          return this.searchFn(trimmed);
        })
      )
      .subscribe(options => {
        this.options = options ?? [];
        this.ensureSelectedOptionPresent();
      });
  }

  writeValue(value: T | null): void {
    this.value = value;
    this.ensureSelectedOptionPresent();
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onOpenedChange(opened: boolean): void {
    if (opened) {
      // Ao abrir, se não houver opções carregadas, faz uma busca inicial
      if (!this.options.length) {
        this.searchFn('')
          .subscribe(options => {
            this.options = options ?? [];
            this.ensureSelectedOptionPresent();
          });
      }
    }
  }

  onSearchInput(term: string): void {
    this.searchTerm = term;
    this.search$.next(term);
  }

  onSelectionChange(value: T): void {
    this.value = value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  private ensureSelectedOptionPresent(): void {
    if (this.value == null || !this.initialLabel) {
      return;
    }

    const exists = this.options.some(o => o.value === this.value);
    if (!exists) {
      this.options = [
        { value: this.value, label: this.initialLabel },
        ...this.options
      ];
    }
  }
}


