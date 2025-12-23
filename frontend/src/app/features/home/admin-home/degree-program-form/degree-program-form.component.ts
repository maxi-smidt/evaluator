import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ButtonModule } from 'primeng/button';
import { AdminDegreeProgram } from '../../../degree-program/models/degree-program.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-degree-program-form',
  templateUrl: './degree-program-form.component.html',
  imports: [ReactiveFormsModule, TranslatePipe, ButtonModule],
})
export class DegreeProgramFormComponent {
  private readonly adminService = inject(AdminService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  protected adminDegreeProgramForm: FormGroup = this.formBuilder.group({
    name: [''],
    abbreviation: [''],
    dpDirector: [null],
  });

  protected readonly degreeProgramDirectors = toSignal(
    this.adminService.getDegreeProgramDirectors(),
  );

  protected onSubmit() {
    if (this.adminDegreeProgramForm.valid) {
      this.adminService
        .registerDegreeProgram(
          this.adminDegreeProgramForm.value as AdminDegreeProgram,
        )
        .subscribe({
          next: () => {
            this.adminDegreeProgramForm.reset();
          },
          error: (err) => {
            if (err.status == 500) {
              this.toastService.error(
                'home.adminHome.degreeProgramForm.error-500',
              );
            } else {
              this.toastService.error(
                'home.adminHome.degreeProgramForm.error-else',
              );
            }
          },
        });
    }
  }
}
