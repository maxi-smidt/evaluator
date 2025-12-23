import { Component, inject } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputOtpModule } from 'primeng/inputotp';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';
import { map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-course-list',
  imports: [
    AccordionModule,
    BadgeModule,
    Button,
    DialogModule,
    InputOtpModule,
    FormsModule,
    TranslatePipe,
  ],
  templateUrl: './course-list.component.html',
})
export class CourseListComponent {
  private readonly courseService = inject(CourseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  private degreeProgramAbbreviation$ = this.route.params.pipe(
    map((params) => params['abbreviation']),
  );
  protected courses = toSignal(
    this.degreeProgramAbbreviation$.pipe(
      switchMap((abbreviation) => this.courseService.getCourses(abbreviation)),
    ),
  );
  protected dialogVisible: boolean = false;
  protected year?: number;
  protected selectedCourseId?: number;

  protected onNewInstanceClick(courseId: number) {
    this.dialogVisible = true;
    this.selectedCourseId = courseId;
  }

  protected onSaveNewInstanceClick() {
    if (this.year === undefined || this.year < new Date().getFullYear() - 1) {
      this.toastService.error('degree-program.courses-view.course-list.error');
      return;
    }

    this.dialogVisible = false;
    this.courseService
      .createCourseInstance(this.selectedCourseId!, this.year)
      .subscribe({
        next: () => {
          this.year = undefined;
        },
      });
  }

  protected routeToCourse(courseId: number) {
    void this.router.navigate(['course', courseId]);
  }
}
