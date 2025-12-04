import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface DsDropdownItem<T = string> {
  id: T;
  label: string;
  disabled?: boolean;
  variant?: 'default' | 'danger';
  tooltip?: string;
}

@Component({
  selector: 'ds-dropdown',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatButtonModule, MatTooltipModule],
  templateUrl: './ds-dropdown.component.html',
  styleUrl: './ds-dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DsDropdownComponent<T = string> {
  // Texto do ícone; por padrão, três pontinhos verticais.
  @Input() icon: string = '⋮';
  @Input() items: DsDropdownItem<T>[] = [];

  @Output() action = new EventEmitter<T>();

  onItemClick(item: DsDropdownItem<T>): void {
    if (item.disabled) return;
    this.action.emit(item.id);
  }
}


