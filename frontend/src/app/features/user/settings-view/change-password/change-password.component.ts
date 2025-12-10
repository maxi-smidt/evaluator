import { Component } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SettingsService } from '../services/settings.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
    selector: 'ms-change-password',
    imports: [TranslatePipe, ReactiveFormsModule, InputTextModule, ButtonModule],
    templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent {
  protected passwordForm = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  errors: string[] = [];

  constructor(
    private settingsService: SettingsService,
    private toastService: ToastService,
  ) {}

  onSubmit() {
    this.errors = [];
    if (this.passwordForm.valid) {
      this.settingsService
        .changePassword(
          this.passwordForm.value.oldPassword!,
          this.passwordForm.value.newPassword!,
          this.passwordForm.value.confirmPassword!,
        )
        .subscribe({
          next: () => {
            this.toastService.success('settings.change-pw.success');
          },
          error: (err) => {
            if (err.status == 400) {
              Object.entries(err.error).forEach(([, messages]) => {
                (messages as string[]).forEach((message) => {
                  this.errors.push(message);
                });
              });
            }
          },
        });
    }
    this.passwordForm.reset();
  }
}
