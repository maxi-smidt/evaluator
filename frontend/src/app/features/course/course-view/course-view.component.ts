import {Component, OnInit} from '@angular/core';
import {CourseService} from "../services/course.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";
import {DetailCourse} from "../models/course.model";
import {Button} from "primeng/button";
import {DataViewModule} from "primeng/dataview";
import {ConfirmationService, MessageService} from "primeng/api";
import {FloatLabelModule} from "primeng/floatlabel";
import {InputTextModule} from "primeng/inputtext";
import {TranslationService} from "../../../shared/services/translation.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputGroupAddonModule} from "primeng/inputgroupaddon";
import {InputGroupModule} from "primeng/inputgroup";
import {AssignmentService} from "../../assignment/services/assignment.service";
import {DialogModule} from "primeng/dialog";
import {InputOtpModule} from "primeng/inputotp";
import {ConfirmPopupModule} from "primeng/confirmpopup";

@Component({
  selector: 'ms-course-view',
  standalone: true,
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
    ConfirmPopupModule
  ],
  templateUrl: './course-view.component.html'
})
export class CourseViewComponent implements OnInit {
  course: DetailCourse = {} as DetailCourse;
  courseBefore: DetailCourse = {} as DetailCourse;

  fileNamePre: string = '';
  fileNameMid: string = '';
  fileNamePost: string = '';

  dialogVisible: boolean = false;
  newAssignmentName: string | undefined;
  newAssignmentNr: number | undefined;

  constructor(private courseService: CourseService,
              private route: ActivatedRoute,
              private router: Router,
              private messageService: MessageService,
              private translationService: TranslationService,
              private assignmentService: AssignmentService,
              private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
    const courseId = this.route.snapshot.params['courseId'];
    this.courseService.getDetailCourse(courseId).subscribe({
      next: value => {
        this.course = value;
        this.courseBefore = JSON.parse(JSON.stringify(value));
        this.parseFileName(value.fileName);
      }
    });
  }

  parseFileName(fileName: string) {
    fileName = fileName.replace(/_{lastname}_/, ';');
    fileName = fileName.replace(/{nr}_/, ';');
    fileName = fileName.replace('.pdf', '');
    [this.fileNamePre, this.fileNameMid, this.fileNamePost] = fileName.split(';');
  }

  makeFileName(): string {
    return `${this.fileNamePre}_{lastname}_${this.fileNameMid}{nr}_${this.fileNamePost}.pdf`;
  }

  routeToAssignment(assignmentId: number) {
    this.router.navigate(['assignment', assignmentId]).then();
  }

  hasChanged(): boolean {
    const transform = (detailCourse: DetailCourse) => {
      let {assignments, ...course} = detailCourse;
      return course;
    };
    this.course.fileName = this.makeFileName();
    return JSON.stringify(transform(this.course)) !== JSON.stringify(transform(this.courseBefore));
  }

  onSubmit() {
    if (!this.hasChanged()) {
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: this.translationService.translate('common.noChangesInfo')
      });
      return;
    }

    let {assignments, id, ...course} = this.course;
    this.courseService.patchCourse(this.course.id, {...course}).subscribe({
      next: value => {
        this.course = value;
        this.courseBefore = JSON.parse(JSON.stringify(value));
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.translationService.translate('common.saved')
        });
      }
    });
  }

  onSaveNewAssignment() {
    if (!this.newAssignmentName || !this.newAssignmentNr) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.translationService.translate('course.courseView.error')
      });
      return;
    }

    this.assignmentService.createAssignment(this.course.id, this.newAssignmentNr, this.newAssignmentName).subscribe({
      next: value => {
        this.routeToAssignment(value.id);
        this.newAssignmentNr = undefined;
        this.newAssignmentName = undefined;
        this.dialogVisible = false;
      },
      error: err => {
        const messageKey = `course.courseView.error-${err.status === 500 ? '500' : 'else'}`;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.translationService.translate(messageKey)
        });
      }
    });
  }

  onDeleteAssignment(event: Event, assignmentId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translationService.translate('common.confirmation.message'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translationService.translate('common.confirmation.accept'),
      rejectLabel: this.translationService.translate('common.confirmation.reject'),
      accept: () => {
        this.assignmentService.deleteAssignment(assignmentId).subscribe({
          next: () => {
            this.course.assignments = this.course.assignments.filter(assignment => assignment.id !== assignmentId);
          }
        });
      }
    });
  }
}
