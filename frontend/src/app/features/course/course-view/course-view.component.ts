import { Component, OnInit } from '@angular/core';
import { CourseService } from '../services/course.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { DetailCourse } from '../models/course.model';
import { Button } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { ConfirmationService } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TranslationService } from '../../../shared/services/translation.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { AssignmentService } from '../../assignment/services/assignment.service';
import { DialogModule } from 'primeng/dialog';
import { InputOtpModule } from 'primeng/inputotp';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastService } from '../../../shared/services/toast.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'ms-course-view',
    imports: [
        TranslatePipe,
        Button,
        DataViewModule,
        FloatLabelModule,
        InputTextModule,
        FormsModule,
        InputGroupAddonModule,
        InputGroupModule,
        ReactiveFormsModule,
        DialogModule,
        InputOtpModule,
        ConfirmPopupModule,
        IconFieldModule,
        InputIconModule,
        TooltipModule,
    ],
    templateUrl: './course-view.component.html'
})
export class CourseViewComponent implements OnInit {
  course: DetailCourse = {} as DetailCourse;
  courseBefore: DetailCourse = {} as DetailCourse;

  dialogVisible: boolean = false;
  newAssignmentName: string | undefined;
  newAssignmentNr: number | undefined;

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router,
    protected translationService: TranslationService,
    private assignmentService: AssignmentService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    const courseId = this.route.snapshot.params['courseId'];
    this.courseService.getDetailCourse(courseId).subscribe({
      next: (value) => {
        this.course = value;
        this.courseBefore = JSON.parse(JSON.stringify(value));
      },
    });
  }

  routeToAssignment(assignmentId: number) {
    this.router.navigate(['assignment', assignmentId]).then();
  }

  hasChanged(): boolean {
    const transform = (detailCourse: DetailCourse) => {
      const courseCopy = JSON.parse(JSON.stringify(detailCourse));
      delete courseCopy.assignments;
      return courseCopy;
    };

    return (
      JSON.stringify(transform(this.course)) !==
      JSON.stringify(transform(this.courseBefore))
    );
  }

  onSubmit() {
    if (!this.hasChanged()) {
      this.toastService.error('common.noChangesInfo');
      return;
    }

    const { assignments: _assignment, id: _id, ...course } = this.course;
    this.courseService.patchCourse(this.course.id, { ...course }).subscribe({
      next: (value) => {
        this.course = value;
        this.courseBefore = JSON.parse(JSON.stringify(value));
        this.toastService.success('common.saved');
      },
    });
  }

  onSaveNewAssignment() {
    if (!this.newAssignmentName || !this.newAssignmentNr) {
      this.toastService.error('course.courseView.error');
      return;
    }

    this.assignmentService
      .createAssignment(
        this.course.id,
        this.newAssignmentNr,
        this.newAssignmentName,
      )
      .subscribe({
        next: (value) => {
          this.routeToAssignment(value.id);
          this.newAssignmentNr = undefined;
          this.newAssignmentName = undefined;
          this.dialogVisible = false;
        },
        error: (err) => {
          const messageKey = `course.courseView.error-${err.status === 500 ? '500' : 'else'}`;
          this.toastService.error(messageKey);
        },
      });
  }

  onDeleteAssignment(event: Event, assignmentId: number) {
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
        this.assignmentService.deleteAssignment(assignmentId).subscribe({
          next: () => {
            this.course.assignments = this.course.assignments.filter(
              (assignment) => assignment.id !== assignmentId,
            );
          },
        });
      },
    });
  }
}
