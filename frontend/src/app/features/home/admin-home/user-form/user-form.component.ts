import {Component} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {MessageService} from "primeng/api";
import {AdminService} from "../../services/admin.service";
import {TranslationService} from "../../../../shared/services/translation.service";
import {NewUser} from "../../../../core/models/user.models";
import {TranslatePipe} from "../../../../shared/pipes/translate.pipe";

@Component({
  selector: 'ms-user-form',
  templateUrl: './user-form.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe
  ]
})
export class UserFormComponent {
  roleChoices: string[];

  constructor(private adminService: AdminService,
              private formBuilder: FormBuilder,
              protected messageService: MessageService,
              private translationService: TranslationService) {
    this.roleChoices = this.translationService.getArray('homeView.adminHome.userForm.role-choices')
  }

  checkoutForm = this.formBuilder.group({
    first_name: '', last_name: '', username: '', password: '', role: ''
  });

  onSubmit() {
    if (this.checkoutForm.valid) {
      this.adminService.registerUser(this.checkoutForm.value as NewUser).subscribe({
        next: () => {
          this.checkoutForm.reset();
        },
        error: err => {
          if (err.status == 500) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.translationService.translate('homeView.adminHome.userForm.error-500')
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.translationService.translate('homeView.adminHome.userForm.error-else')
            });
          }
        }
      });
    }
  }
}
