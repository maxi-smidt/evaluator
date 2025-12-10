import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { Course } from '../../models/course.model';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputOtpModule } from 'primeng/inputotp';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ActivatedRoute, Router } from '@angular/router';
import { UrlParamService } from '../../../../shared/services/url-param.service';
import { ToastService } from '../../../../shared/services/toast.service';

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
export class CourseListComponent implements OnInit {
  simpleCourses: Course[] = [];
  dialogVisible: boolean = false;
  year: number | undefined;
  selectedCourseId: number | undefined;

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private urlParamService: UrlParamService,
    private router: Router,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    const degreeProgramAbbreviation = this.urlParamService.findParam(
      'abbreviation',
      this.route,
    );

    this.courseService.getCourses(degreeProgramAbbreviation).subscribe({
      next: (value) => {
        this.simpleCourses = value;
      },
    });
  }

  onNewInstanceClick(event: MouseEvent, courseId: number) {
    this.dialogVisible = true;
    event.stopPropagation();
    this.selectedCourseId = courseId;
  }

  onSaveNewInstanceClick() {
    if (this.year === undefined || this.year < new Date().getFullYear() - 1) {
      this.toastService.error('degree-program.courses-view.course-list.error');
      return;
    }

    this.dialogVisible = false;
    this.courseService
      .createCourseInstance(this.selectedCourseId!, this.year!)
      .subscribe({
        next: () => {
          this.year = undefined;
        },
      });
  }

  routeToCourse(courseId: number) {
    this.router.navigate(['course', courseId]).then();
  }
}
