import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterOutlet,} from "@angular/router";
import {ConfirmationService, MessageService} from "primeng/api";
import {AssignmentInstance} from "../models/assignment.model";
import {TranslationService} from "../../../shared/services/translation.service";
import {CorrectionService} from "../../correction/services/correction.service";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {AccordionModule} from "primeng/accordion";
import {TableModule} from "primeng/table";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";
import {TagModule} from "primeng/tag";
import {NgForOf, NgIf} from "@angular/common";
import {AssignmentService} from "../services/assignment.service";

@Component({
  selector: 'ms-assignment-instance-view',
  templateUrl: './assignment-instance-view.component.html',
  standalone: true,
  imports: [
    ConfirmDialogModule,
    AccordionModule,
    TableModule,
    TranslatePipe,
    TagModule,
    RouterOutlet,
    NgForOf,
    NgIf
  ]
})
export class AssignmentInstanceViewComponent implements OnInit {
  assignment: AssignmentInstance;
  cols: {field: string, header: string}[];
  groups: string[];
  assignmentId: number;

  constructor(private route: ActivatedRoute,
              private translationService: TranslationService,
              private correctionService: CorrectionService,
              private router: Router,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,
              private assignmentService: AssignmentService) {
    this.cols = [
      {field: 'lastName', header: this.translate('common.lastname')},
      {field: 'firstName', header: this.translate('common.firstname')},
      {field: 'points', header: this.translate('course.assignmentView.evaluation')},
      {field: 'status', header: this.translate('course.assignmentView.status')},
      {field: 'action', header: this.translate('course.assignmentView.action')},
      {field: 'lateSubmission', header: this.translate('course.assignmentView.lateSubmission')}
    ]
    this.groups = [];
    this.assignmentId = -1;
    this.assignment = {} as AssignmentInstance;
  }

  ngOnInit() {
    this.assignmentId = this.route.snapshot.params['assignmentId'];

    this.assignmentService.getFullAssignmentInstance(this.assignmentId).subscribe({
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

  onStudentClick(studentId: string, state: string, correctionId: number) {
    if (state === 'CORRECTED' || state === 'NOT_SUBMITTED') {
      return
    }
    if (state === 'UNDEFINED') {
      this.correctionService.createCorrection(studentId, this.assignmentId, 'IN_PROGRESS').subscribe({
        next: value => {
          this.router.navigate(['correction', value.id]).then();
        }
      });
    } else {
      this.router.navigate(['correction', correctionId]).then();
    }
  }

  notSubmittedAction(studentId: string, group: string) {
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
        this.router.navigate(['correction', correctionId]).then();
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
