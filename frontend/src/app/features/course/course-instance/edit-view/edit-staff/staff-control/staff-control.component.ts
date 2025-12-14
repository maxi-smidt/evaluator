import { Component, input, model } from '@angular/core';
import { Button } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TranslatePipe } from '../../../../../../shared/pipes/translate.pipe';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../../../core/models/user.models';

@Component({
  selector: 'ms-staff-control',
  imports: [Button, MultiSelectModule, TranslatePipe, FormsModule],
  templateUrl: './staff-control.component.html',
})
export class StaffControlComponent {
  title = input.required<string>();
  placeHolder = input.required<string>();

  selectedUsers = model.required<User[]>();
  selectableUsers = input.required<User[]>();

  onDelete(username: string) {
    const updated = this.selectedUsers().filter(
      (user) => user.username !== username,
    );
    this.selectedUsers.set(updated);
  }
}
