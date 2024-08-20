import {Component} from '@angular/core';
import {TranslatePipe} from "../../../../shared/pipes/translate.pipe";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {SettingsService} from "../services/settings.service";
import {MessageService} from "primeng/api";
import {TranslationService} from "../../../../shared/services/translation.service";

@Component({
  selector: 'ms-change-password',
  standalone: true,
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent {
  protected passwordForm = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  errors: string[] = [];

  constructor(private settingsService: SettingsService,
              private messageService: MessageService,
              private translationService: TranslationService) {
  }

  onSubmit() {
    this.errors = [];
    if (this.passwordForm.valid) {
      this.settingsService.changePassword(this.passwordForm.value.oldPassword!,
        this.passwordForm.value.newPassword!, this.passwordForm.value.confirmPassword!).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.translationService.translate('settings.change-pw.success')
          })
        },
        error: err => {
          if (err.status == 400) {
            Object.entries(err.error).forEach(([_, messages]) => {
              (messages as string[]).forEach(message => {
                this.errors.push(message);
              });
            });
          }
        }
      });
    }
    this.passwordForm.reset()
  }
}
