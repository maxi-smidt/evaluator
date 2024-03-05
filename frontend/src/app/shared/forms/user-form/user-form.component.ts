import {Component, input} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {MessageService} from "primeng/api";
import {TranslationService} from "../../services/translation.service";
import {NewUser} from "../../../core/models/user.models";
import {TranslatePipe} from "../../pipes/translate.pipe";
import {ButtonModule} from "primeng/button";
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {UserService} from "../../../core/services/user.service";

@Component({
  selector: 'ms-user-form',
  templateUrl: './user-form.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule
  ]
})
export class UserFormComponent {
  roleChoices = input.required<string[]>();

  constructor(private userService: UserService,
              private formBuilder: FormBuilder,
              protected messageService: MessageService,
              private translationService: TranslationService) {
  }

  checkoutForm = this.formBuilder.group({
    first_name: '', last_name: '', username: '', password: '', role: ''
  });

  onSubmit() {
    if (this.checkoutForm.valid) {
      this.userService.registerUser(this.checkoutForm.value as NewUser).subscribe({
        next: () => {
          this.checkoutForm.reset();
        },
        error: err => {
          if (err.status == 500) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.translationService.translate('shared.forms.userForm.error-500')
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.translationService.translate('shared.forms.userForm.error-else')
            });
          }
        }
      });
    }
  }
}
