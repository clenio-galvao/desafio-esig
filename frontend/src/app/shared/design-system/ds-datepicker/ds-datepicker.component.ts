import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'ds-datepicker',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './ds-datepicker.component.html',
  styleUrl: './ds-datepicker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DsDatepickerComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DsDatepickerComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error: string | null = null;
  @Input() min: Date | null = null;
  @Input() max: Date | null = null;

  value: Date | null = null;
  disabled = false;

  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: Date | string | null): void {
    if (value instanceof Date) {
      this.value = value;
    } else if (typeof value === 'string' && value) {
      const parsed = new Date(value);
      this.value = isNaN(parsed.getTime()) ? null : parsed;
    } else {
      this.value = null;
    }
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onDateChange(date: Date | null): void {
    this.value = date;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}


