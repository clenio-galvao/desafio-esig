import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'ds-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './ds-button.component.html',
  styleUrl: './ds-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DsButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  @Input() fullWidth = false;
  @Input() disabled = false;
}


