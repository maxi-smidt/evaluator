import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
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
import { Button } from 'primeng/button';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-assignment-instance-view',
  templateUrl: './assignment-instance-view.component.html',
  imports: [
    ConfirmDialogModule,
    AccordionModule,
    TableModule,
    TranslatePipe,
    TagModule,
    TooltipModule,
    Button,
  ],
})
export class AssignmentInstanceViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly translationService = inject(TranslationService);
  private readonly correctionService = inject(CorrectionService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly assignmentService = inject(AssignmentService);
  private readonly toastService = inject(ToastService);

  private readonly refresh$ = new BehaviorSubject<void>(undefined);
  private readonly assignmentId$ = this.route.params.pipe(
    map((params) => Number(params['assignmentId'])),
  );
  private readonly assignmentId = toSignal(this.assignmentId$);
  protected readonly assignment = toSignal(
    combineLatest([this.assignmentId$, this.refresh$]).pipe(
      switchMap(([id, _]) =>
        this.assignmentService.getFullAssignmentInstance(id),
      ),
    ),
  );
  protected readonly groups = computed(() =>
    Object.keys(this.assignment()?.groupedStudents ?? []).map((v) => Number(v)),
  );

  private translate(key: string) {
    return this.translationService.translate(key);
  }

  protected getSeverity(status: CorrectionStatus) {
    switch (status) {
      case CorrectionStatus.CORRECTED:
        return 'success';
      case CorrectionStatus.IN_PROGRESS:
        return 'info';
      case CorrectionStatus.NOT_SUBMITTED:
        return 'danger';
      case CorrectionStatus.UNDEFINED:
        return 'warn';
    }
  }

  protected onStartOrResumeAction(
    studentId: string,
    state: CorrectionStatus,
    correctionId: number,
  ) {
    const isFinished =
      state === CorrectionStatus.CORRECTED ||
      state === CorrectionStatus.NOT_SUBMITTED;

    if (isFinished) {
      return;
    }

    if (state === CorrectionStatus.UNDEFINED) {
      this.correctionService
        .createCorrection(
          studentId,
          this.assignmentId()!,
          CorrectionStatus.IN_PROGRESS,
        )
        .subscribe({
          next: (value) => {
            void this.router.navigate(['correction', value.id]);
          },
        });
    }
    void this.router.navigate(['correction', correctionId]);
  }

  protected notSubmittedAction(studentId: string) {
    this.correctionService
      .createCorrection(
        studentId,
        this.assignmentId()!,
        CorrectionStatus.NOT_SUBMITTED,
      )
      .subscribe({
        next: () => this.refresh$.next(),
      });
  }

  protected editAction(correctionId: number) {
    this.correctionService
      .patchCorrection(correctionId, { status: CorrectionStatus.IN_PROGRESS })
      .subscribe({
        next: () => {
          void this.router.navigate(['correction', correctionId]);
        },
        error: () =>
          this.toastService.info('course.assignmentView.error-no-access'),
      });
  }

  protected deleteAction(correctionId: number) {
    this.confirmDialog().then((result) => {
      if (result) {
        this.correctionService.deleteCorrection(correctionId).subscribe({
          next: () => this.refresh$.next(),
          error: () => {
            this.toastService.info('course.assignmentView.error-no-access');
          },
        });
      }
    });
  }

  protected downloadAction(correctionId: number) {
    this.correctionService.downloadCorrection(correctionId);
  }

  protected viewOnlyAction(correctionId: number) {
    this.router.navigate(['correction', correctionId]).then();
  }

  private confirmDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: this.translate('common.confirmation.message-delete'),
        acceptLabel: this.translate('common.confirmation.accept'),
        rejectLabel: this.translate('common.confirmation.reject'),
        header: this.translate('common.confirmation.header'),
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
