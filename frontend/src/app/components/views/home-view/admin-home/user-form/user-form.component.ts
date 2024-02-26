import {Component} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {NewUser} from "../../../../../interfaces/user";
import {AdminService} from "../../../../../services/admin.service";
import {MessageService} from "primeng/api";
import {TranslationService} from "../../../../../services/translation.service";

@Component({
  selector: 'ms-user-form',
  templateUrl: './user-form.component.html'
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
              detail: this.translationService.get('homeView.adminHome.userForm.error-500')
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.translationService.get('homeView.adminHome.userForm.error-else')
            });
          }
        }
      });
    }
  }
}
