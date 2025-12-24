import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PasswordUser } from '../../../core/models/user.models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-user-form',
  templateUrl: './user-form.component.html',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ButtonModule,
    ConfirmDialogModule,
  ],
})
export class UserFormComponent {
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  protected roleChoices = toSignal(this.userService.getUserRoles());

  protected checkoutForm = this.formBuilder.group({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    role: '',
  });

  protected onSubmit() {
    if (this.checkoutForm.valid) {
      this.userService
        .registerUser(this.checkoutForm.value as PasswordUser)
        .subscribe({
          next: () => {
            this.checkoutForm.reset();
          },
          error: (err) => {
            if (err.status == 500) {
              this.toastService.error('shared.forms.userForm.error-500');
            } else {
              this.toastService.error('shared.forms.userForm.error-else');
            }
          },
        });
    }
  }
}
