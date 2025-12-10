import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ButtonModule } from 'primeng/button';
import { AdminDegreeProgram } from '../../../degree-program/models/degree-program.model';
import { SimpleUser } from '../../../../core/models/user.models';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
    selector: 'ms-degree-program-form',
    templateUrl: './degree-program-form.component.html',
    imports: [ReactiveFormsModule, TranslatePipe, ButtonModule]
})
export class DegreeProgramFormComponent implements OnInit {
  degreeProgramDirectorChoices: SimpleUser[] = [];
  adminDegreeProgramForm: FormGroup;

  constructor(
    private adminService: AdminService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
  ) {
    this.adminDegreeProgramForm = this.formBuilder.group({
      name: [''],
      abbreviation: [''],
      dpDirector: [null],
    });
  }

  ngOnInit() {
    this.adminService.getDegreeProgramDirectors().subscribe({
      next: (value) => {
        this.degreeProgramDirectorChoices = value;
      },
    });
  }

  onSubmit() {
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
