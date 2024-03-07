import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterOutlet,} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {Assignment} from "../models/assignment.model";
import {CourseService} from "../services/course.service";
import {TranslationService} from "../../../shared/services/translation.service";
import {CorrectionService} from "../services/correction.service";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToastModule} from "primeng/toast";
import {AccordionModule} from "primeng/accordion";
import {TableModule} from "primeng/table";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";
import {TagModule} from "primeng/tag";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'ms-assignment-view',
  templateUrl: './assignment-view.component.html',
  standalone: true,
  imports: [
    ConfirmDialogModule,
    ToastModule,
    AccordionModule,
    TableModule,
    TranslatePipe,
    TagModule,
    RouterOutlet,
    NgForOf,
    NgIf
  ]
})
export class AssignmentViewComponent implements OnInit {
  assignment: Assignment;
  cols: {field: string, header: string}[];
  groups: string[];
  assignmentId: number;
  courseId: number;

  constructor(private courseService: CourseService,
              private route: ActivatedRoute,
              private translationService: TranslationService,
              private correctionService: CorrectionService,
              private router: Router,
              private confirmationService: ConfirmationService,
              private messageService: MessageService) {
    this.cols = [
      {field: 'lastName', header: this.translate('course.assignmentView.last_name')},
      {field: 'firstName', header: this.translate('course.assignmentView.first_name')},
      {field: 'points', header: this.translate('course.assignmentView.evaluation')},
      {field: 'status', header: this.translate('course.assignmentView.status')},
      {field: 'action', header: this.translate('course.assignmentView.action')}
    ]
    this.groups = [];
    this.assignmentId = -1;
    this.courseId = -1;
    this.assignment = {} as Assignment;
  }

  ngOnInit() {
    this.courseId = this.route.parent!.parent!.snapshot.params['courseId'];
    this.assignmentId = this.route.parent!.snapshot.params['assignmentId'];

    this.courseService.getFullAssignment(this.assignmentId).subscribe({
      next: value => {
        this.assignment = value;
        this.groups = Object.keys(this.assignment.groupedStudents);
        this.adjustTargetGroupsToIndex();
      }
    });
  }

  private translate(key: string) {
    return this.translationService.translate(key);
  }

  private adjustTargetGroupsToIndex() {
    this.assignment?.targetGroups.forEach((value, index, arr) => {
      arr[index] = value - 1;
    });
  }

  getSeverity(status: string) {
    switch (status) {
      case 'CORRECTED':
        return 'success';
      case 'IN_PROGRESS':
        return 'info';
      case 'NOT_SUBMITTED':
        return 'danger';
      default:
        return 'warning';
    }
  }

  onStudentClick(studentId: number, state: string, correctionId: number) {
    if (state === 'CORRECTED' || state === 'NOT_SUBMITTED') {
      return
    }
    if (state === 'UNDEFINED') {
      this.correctionService.createCorrection(studentId, this.assignmentId, 'IN_PROGRESS').subscribe({
        next: value => {
          this.router.navigate(['correction', value.id], {relativeTo: this.route}).then();
        }
      });
    } else {
      this.router.navigate(['correction', correctionId], {relativeTo: this.route}).then();
    }
  }

  notSubmittedAction(studentId: number, group: string) {
    const status = 'NOT_SUBMITTED';
    this.correctionService.createCorrection(studentId, this.assignmentId, status).subscribe({
      next: () => {
        const student = this.assignment.groupedStudents[group].find(student => student.id === studentId)!;
        student.status = status;
      }
    });
  }

  editAction(correctionId: number) {
    this.correctionService.patchCorrection(correctionId, {status: 'IN_PROGRESS'}).subscribe({
      next: () => {
        this.router.navigate(['correction', correctionId], {relativeTo: this.route}).then();
      }
    });
  }

  deleteAction(correctionId: number, group: string) {
    this.confirmDialog().then(
      result => {
        if (result) {
          this.correctionService.deleteCorrection(correctionId).subscribe({
            next: () => {
              const student = this.assignment.groupedStudents[group].find(student => student.correctionId === correctionId)!;
              student.correctionId = null as unknown as number;
              student.points = null as unknown as number;
              student.status = 'UNDEFINED';
            },
            error: err => {
              if (err.status === 403) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: this.translate('course.assignmentView.error-403')
                });
              }
            }
          });
        }
      }
    );
  }

  downloadAction(correctionId: number) {
    this.correctionService.downloadCorrection(correctionId);
  }

  private confirmDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete the correction',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon: "none",
        rejectIcon: "none",
        rejectButtonStyleClass: "p-button-text",
        accept: () => {
          resolve(true);
        },
        reject: () => {
          resolve(false);
        }
      });
    });
  }
}
