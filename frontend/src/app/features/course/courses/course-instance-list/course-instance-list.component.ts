import { Component, computed, inject } from '@angular/core';
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
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TranslationService } from '../../../../shared/services/translation.service';
import { map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

interface GroupedCourse {
  course: Course;
  courseInstances: SimpleCourseInstance[];
}

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
export class CourseInstanceListComponent {
  private readonly courseService = inject(CourseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translationService = inject(TranslationService);

  private degreeProgramAbbreviation$ = this.route.params.pipe(
    map((params) => params['abbreviation']),
  );
  private courseInstances = toSignal(
    this.degreeProgramAbbreviation$.pipe(
      switchMap((abbreviation) =>
        this.courseService.getCourseInstances(abbreviation),
      ),
    ),
  );
  protected sortedCourses = computed(() => {
    const instances = this.courseInstances();
    if (!instances) return [];
    const groups = new Map<number, GroupedCourse>();

    for (const instance of instances) {
      const courseId = instance.course.id;

      if (!groups.has(courseId)) {
        groups.set(courseId, {
          course: instance.course,
          courseInstances: [],
        });
      }
      groups.get(courseId)!.courseInstances.push(instance);
    }
    return Array.from(groups.values());
  });

  protected onDeleteCourseInstance(event: Event, courseInstanceId: number) {
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
            this.sortedCourses().forEach((obj) => {
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

  protected routeToCourseInstanceEdit(courseInstanceId: number) {
    void this.router.navigate(['course', 'instance', courseInstanceId, 'edit']);
  }
}
