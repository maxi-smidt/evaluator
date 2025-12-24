import { Component, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CourseService } from '../../../features/course/services/course.service';
import { Course } from '../../../features/course/models/course.model';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { DegreeProgramService } from '../../../features/degree-program/services/degree-program.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastService } from '../../services/toast.service';
import { map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-course-form',
  imports: [
    Button,
    ConfirmDialogModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    CheckboxModule,
  ],
  templateUrl: './course-form.component.html',
})
export class CourseFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly courseService = inject(CourseService);
  private readonly degreeProgramService = inject(DegreeProgramService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  private degreeProgramAbbreviation$ = this.route.params.pipe(
    map((params) => params['abbreviation']),
  );
  private degreeProgram = toSignal(
    this.degreeProgramAbbreviation$.pipe(
      switchMap((abbreviation) =>
        this.degreeProgramService.getDegreeProgram(abbreviation),
      ),
    ),
  );
  protected submitted = false;
  protected redirect: boolean = false;
  protected checkoutForm = this.formBuilder.group({
    name: ['', Validators.required],
    abbreviation: ['', Validators.required],
    text1: ['', Validators.required],
    text2: '',
    text3: '',
  });

  get f() {
    return this.checkoutForm.controls;
  }

  protected onSubmit() {
    this.submitted = true;

    if (this.checkoutForm.invalid) {
      return;
    }

    const formValue = this.checkoutForm.value;
    const fileName = `${formValue.text1}_{lastname}_${formValue.text2}{nr}_${formValue.text3}.pdf`;
    const course: Course = {
      id: -1,
      name: formValue.name!,
      abbreviation: formValue.abbreviation!,
      fileName: fileName,
    };

    this.courseService.createCourse(this.degreeProgram()!, course).subscribe({
      next: (value) => {
        this.submitted = false;
        this.checkoutForm.reset();
        this.toastService.success('common.saved');

        if (this.redirect) {
          void this.router.navigate(['course', value.id]);
        }
      },
      error: (err) => {
        const errorMessage =
          err.status == 500
            ? 'shared.forms.course-form.error-500'
            : 'shared.forms.course-form.error-else';
        this.toastService.error(errorMessage);
      },
    });
  }
}
