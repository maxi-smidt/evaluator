import { Component, input } from '@angular/core';
import { ClassGroup } from '../../../models/class-group.model';
import { SelectModule } from 'primeng/select';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Button } from 'primeng/button';
import { StudentService } from '../../../services/student.service';
import { Student } from '../../../../course/models/student.model';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastService } from '../../../../../shared/services/toast.service';

@Component({
  selector: 'ms-single-student-form',
  imports: [
    SelectModule,
    TranslatePipe,
    FormsModule,
    Button,
    ReactiveFormsModule,
    InputTextModule,
    FloatLabelModule,
  ],
  templateUrl: './single-student-form.component.html',
})
export class SingleStudentFormComponent {
  classGroups = input.required<ClassGroup[]>();

  checkoutForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private studentService: StudentService,
    private toastService: ToastService,
  ) {
    this.checkoutForm = this.formBuilder.group({
      id: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      classGroup: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      this.studentService
        .createStudent(this.checkoutForm.value as Student)
        .subscribe({
          next: () => {
            this.toastService.success('common.saved');
            this.checkoutForm.reset();
          },
          error: (err) => {
            if (err.status == 500) {
              this.toastService.error(
                'degree-program.student-view.students-error',
              );
            }
          },
        });
    }
  }
}
