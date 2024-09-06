import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { AssignmentInstance } from '../models/assignment.model';
import { TranslationService } from '../../../shared/services/translation.service';
import { CorrectionService } from '../../correction/services/correction.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TagModule } from 'primeng/tag';
import { AssignmentService } from '../services/assignment.service';
import { CorrectionStatus } from '../../correction/models/correction.model';
import { TooltipModule } from 'primeng/tooltip';
import { ToastService } from '../../../shared/services/toast.service';

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
    TooltipModule,
  ],
})
export class AssignmentInstanceViewComponent implements OnInit {
  assignment: AssignmentInstance;
  cols: { field: string; header: string; width: number }[];
  groups: string[];
  assignmentId: number;

  constructor(
    private route: ActivatedRoute,
    private translationService: TranslationService,
    private correctionService: CorrectionService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private assignmentService: AssignmentService,
    private toastService: ToastService,
  ) {
    this.cols = [
      {
        field: 'lastName',
        header: this.translate('common.lastname'),
        width: 25,
      },
      {
        field: 'firstName',
        header: this.translate('common.firstname'),
        width: 25,
      },
      {
        field: 'points',
        header: this.translate('course.assignmentView.evaluation'),
        width: 10,
      },
      {
        field: 'status',
        header: this.translate('course.assignmentView.status'),
        width: 15,
      },
      {
        field: 'action',
        header: this.translate('course.assignmentView.action'),
        width: 20,
      },
      {
        field: 'lateSubmission',
        header: this.translate('course.assignmentView.lateSubmission'),
        width: 5,
      },
    ];
    this.groups = [];
    this.assignmentId = -1;
    this.assignment = {} as AssignmentInstance;
  }

  ngOnInit() {
    this.assignmentId = this.route.snapshot.params['assignmentId'];

    this.assignmentService
      .getFullAssignmentInstance(this.assignmentId)
      .subscribe({
        next: (value) => {
          this.assignment = value;
          this.groups = Object.keys(this.assignment.groupedStudents);
          this.adjustTargetGroupsToIndex();
        },
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

  getSeverity(status: CorrectionStatus) {
    switch (status) {
      case CorrectionStatus.CORRECTED:
        return 'success';
      case CorrectionStatus.IN_PROGRESS:
        return 'info';
      case CorrectionStatus.NOT_SUBMITTED:
        return 'danger';
      case CorrectionStatus.UNDEFINED:
        return 'warning';
    }
  }

  onStartOrResumeAction(
    studentId: string,
    state: CorrectionStatus,
    correctionId: number,
  ) {
    if (
      state === CorrectionStatus.CORRECTED ||
      state === CorrectionStatus.NOT_SUBMITTED
    ) {
      return;
    }
    if (state === CorrectionStatus.UNDEFINED) {
      this.correctionService
        .createCorrection(
          studentId,
          this.assignmentId,
          CorrectionStatus.IN_PROGRESS,
        )
        .subscribe({
          next: (value) => {
            this.router.navigate(['correction', value.id]).then();
          },
        });
    } else {
      this.router.navigate(['correction', correctionId]).then();
    }
  }

  notSubmittedAction(studentId: string, group: string) {
    this.correctionService
      .createCorrection(
        studentId,
        this.assignmentId,
        CorrectionStatus.NOT_SUBMITTED,
      )
      .subscribe({
        next: (correction) => {
          const student = this.assignment.groupedStudents[group].find(
            (student) => student.id === studentId,
          )!;
          student.status = correction.status;
          student.correctionId = correction.id;
        },
      });
  }

  editAction(correctionId: number) {
    this.correctionService
      .patchCorrection(correctionId, { status: CorrectionStatus.IN_PROGRESS })
      .subscribe({
        next: () => {
          this.router.navigate(['correction', correctionId]).then();
        },
        error: () => {
          this.toastService.info('course.assignmentView.error-no-access');
        },
      });
  }

  deleteAction(correctionId: number, group: string) {
    this.confirmDialog().then((result) => {
      if (result) {
        this.correctionService.deleteCorrection(correctionId).subscribe({
          next: () => {
            const student = this.assignment.groupedStudents[group].find(
              (student) => student.correctionId === correctionId,
            )!;
            student.correctionId = null as unknown as number;
            student.points = null as unknown as number;
            student.status = CorrectionStatus.UNDEFINED;
          },
          error: () => {
            this.toastService.info('course.assignmentView.error-no-access');
          },
        });
      }
    });
  }

  downloadAction(correctionId: number) {
    this.correctionService.downloadCorrection(correctionId);
  }

  viewOnlyAction(correctionId: number) {
    this.router.navigate(['correction', correctionId]).then();
  }

  private confirmDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: this.translate('common.confirmation.message-delete'),
        acceptLabel: this.translate('common.confirmation.accept'),
        rejectLabel: this.translate('common.confirmation.reject'),
        header: this.translationService.translate('common.confirmation.header'),
        icon: 'pi pi-exclamation-triangle',
        rejectButtonStyleClass: 'p-button-text',
        accept: () => {
          resolve(true);
        },
        reject: () => {
          resolve(false);
        },
      });
    });
  }

  protected readonly CorrectionStatus = CorrectionStatus;
}
