import { Component, OnInit } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CourseService } from '../../services/course.service';
import { Course, SimpleCourseInstance } from '../../models/course.model';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { Button } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { ConfirmationService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { ActivatedRoute, Router } from '@angular/router';
import { UrlParamService } from '../../../../shared/services/url-param.service';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TranslationService } from '../../../../shared/services/translation.service';

@Component({
  selector: 'ms-course-instance-list',
  imports: [
    TranslatePipe,
    AccordionModule,
    BadgeModule,
    Button,
    DataViewModule,
    TagModule,
    ConfirmPopupModule,
  ],
  templateUrl: './course-instance-list.component.html',
})
export class CourseInstanceListComponent implements OnInit {
  courseInstances: SimpleCourseInstance[] = [];
  sortedCourses: { course: Course; courseInstances: SimpleCourseInstance[] }[] =
    [];

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private urlParamService: UrlParamService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private translationService: TranslationService,
  ) {}

  ngOnInit() {
    const degreeProgramAbbreviation = this.urlParamService.findParam(
      'abbreviation',
      this.route,
    );

    this.courseService.getCourseInstances(degreeProgramAbbreviation).subscribe({
      next: (value) => {
        this.courseInstances = value;

        this.courseInstances.forEach((courseInstance) => {
          const obj = this.sortedCourses.find(
            (x) => courseInstance.course.id === x.course.id,
          );
          if (obj === undefined) {
            this.sortedCourses.push({
              course: courseInstance.course,
              courseInstances: [courseInstance],
            });
          } else {
            obj.courseInstances.push(courseInstance);
          }
        });
      },
    });
  }

  onDeleteCourseInstance(event: Event, courseInstanceId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      header: this.translationService.translate('common.confirmation.header'),
      message: this.translationService.translate(
        'common.confirmation.message-delete',
      ),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translationService.translate(
        'common.confirmation.accept',
      ),
      rejectLabel: this.translationService.translate(
        'common.confirmation.reject',
      ),
      accept: () => {
        this.courseService.deleteCourseInstance(courseInstanceId).subscribe({
          next: () => {
            this.sortedCourses.forEach((obj) => {
              obj.courseInstances = obj.courseInstances.filter(
                (courseInstance) => {
                  return courseInstance.id !== courseInstanceId;
                },
              );
            });
          },
        });
      },
    });
  }

  routeToCourseInstanceEdit(courseInstanceId: number) {
    this.router
      .navigate(['course', 'instance', courseInstanceId, 'edit'])
      .then();
  }
}
