import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import {
  Correction,
  CorrectionDraft,
  CorrectionStatus,
} from '../models/correction.model';
import { CorrectionService } from '../services/correction.service';
import { EvaluateTableComponent } from './evaluate-table/evaluate-table.component';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { tap } from 'rxjs';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { Student } from '../../course/models/student.model';
import { TranslationService } from '../../../shared/services/translation.service';
import { CourseService } from '../../course/services/course.service';
import {
  CourseInstance,
  SerializerType,
} from '../../course/models/course.model';
import { ToastService } from '../../../shared/services/toast.service';
import { PreviousDeductionsService } from '../../previous-deductions/services/previous-deductions.service';
import { PreviousDeductions } from '../../previous-deductions/models/previous-deduction.model';

@Component({
  selector: 'ms-correction-view',
  templateUrl: './correction-view.component.html',
  standalone: true,
  imports: [
    EvaluateTableComponent,
    ContextMenuModule,
    ConfirmDialogModule,
    TranslatePipe,
    DialogModule,
    FormsModule,
    FloatLabelModule,
    InputTextModule,
  ],
})
export class CorrectionViewComponent implements OnInit, OnDestroy {
  interval: NodeJS.Timeout | undefined;
  correctionId: number;

  course: CourseInstance;
  correction: Correction;
  correctionBefore: Correction;

  readOnly: boolean = false;

  expenseElement: { minute: number; hour: number } = { minute: 0, hour: 0 };
  expenseNotSet: boolean = false;

  annotationPoints: number = 0;
  pointsDistribution: {
    [exerciseKey: string]: { [subExerciseKey: string]: number };
  } = {};

  hasLateSubmitted: boolean = false;
  lateSubmissionPenalty: number = 0;

  showPreviousDeductions: boolean = false;
  previousDeductions: PreviousDeductions | undefined;

  constructor(
    private correctionService: CorrectionService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private userService: UserService,
    private location: Location,
    private translationService: TranslationService,
    private courseService: CourseService,
    private previousDeductionsService: PreviousDeductionsService,
  ) {
    this.correction = {
      draft: {} as CorrectionDraft,
      student: {} as Student,
      assignment: { points: -1, name: '' },
    } as Correction;
    this.course = { pointStepSize: 0 } as CourseInstance;
    this.correctionBefore = {} as Correction;
    this.correctionId = -1;
  }

  ngOnInit() {
    this.correctionId = this.route.snapshot.params['correctionId'];

    this.userService.getUser().subscribe({
      next: (user) => {
        this.correctionService.getCorrection(this.correctionId).subscribe({
          next: (correction) => {
            this.correction = correction;
            this.hasLateSubmitted = this.correction.lateSubmittedDays > 0;
            this.parseExpense();
            this.correctionBefore = JSON.parse(JSON.stringify(correction));
            this.readOnly =
              this.correction.status === CorrectionStatus.CORRECTED ||
              correction.tutorUsername !== user.username;

            this.courseService
              .getCourseInstance<CourseInstance>(
                this.correction.courseInstanceId,
                SerializerType.NORMAL,
              )
              .subscribe({
                next: (course) => {
                  this.course = course;
                  this.calculateLateSubmission();
                },
              });
          },
          error: () => {
            this.location.back();
          },
          complete: () => {
            this.initPoints();
          },
        });
      },
    });

    if (!this.readOnly) {
      this.interval = setInterval(() => {
        this.saveCorrectionIfChanged();
      }, 10000);
    }
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private saveCorrection(triggered: boolean = false) {
    return this.correctionService
      .patchCorrection(this.correctionId!, {
        points: this.totalPoints,
        draft: this.correction.draft,
        expense: this.correction.expense,
        lateSubmittedDays: this.correction.lateSubmittedDays,
      })
      .pipe(
        tap({
          next: (response) => {
            if (triggered) {
              this.toastService.info('common.saved');
            }
            this.correction.expense = response.expense;
            this.correction.lateSubmittedDays = response.lateSubmittedDays;
            this.correction.status = response.status;
            this.correction.points = response.points;
            this.parseExpense();
            this.correctionBefore = JSON.parse(JSON.stringify(response));
            this.calculateLateSubmission();
          },
          error: (error) => {
            this.toastService.error('course.evaluateView.couldNotSave');
            throw error;
          },
        }),
      );
  }

  private saveCorrectionIfChanged(triggered: boolean = false) {
    if (this.hasChanged()) {
      this.saveCorrection(triggered).subscribe();
    } else {
      if (triggered) {
        this.toastService.info('common.noChangesInfo');
      }
    }
  }

  private initPoints() {
    for (const exc of this.correction.draft.exercise) {
      this.pointsDistribution[exc.name] = {};
      for (const subExc of exc.sub) {
        const points = subExc.notes.reduce((acc, note) => acc + note.points, 0);
        this.pointsDistribution[exc.name][subExc.name] = subExc.points + points;
      }
    }
    this.annotationPoints = this.correction.draft.annotations.reduce(
      (acc, entry) => acc + entry.points,
      0,
    );
  }

  protected updateSubExercisePoints(
    points: number,
    subExerciseName: string,
    exerciseName: string,
  ) {
    this.pointsDistribution[exerciseName][subExerciseName] = points;
  }

  protected updateAnnotationPoints(points: number) {
    this.annotationPoints = points;
  }

  get totalPoints() {
    let totalPoints = this.annotationPoints;
    Object.values(this.pointsDistribution).forEach((subExercises) => {
      Object.values(subExercises).forEach((points) => {
        totalPoints += points;
      });
    });
    totalPoints += this.lateSubmissionPenalty;
    return totalPoints;
  }

  protected getTotalExercisePoints(exerciseName: string) {
    return this.correction.draft.exercise
      .find((ex) => ex.name === exerciseName)!
      .sub.reduce((acc, subExercise) => acc + subExercise.points, 0);
  }

  protected currentExercisePoints(exerciseName: string) {
    return Object.values(this.pointsDistribution[exerciseName] || {}).reduce(
      (acc, points) => acc + points,
      0,
    );
  }

  private hasChanged() {
    return (
      JSON.stringify(this.correction) !== JSON.stringify(this.correctionBefore)
    );
  }

  public checkChanges() {
    if (!this.hasChanged()) {
      return true;
    }
    return this.confirmDialog().then((result) => {
      return result;
    });
  }

  private confirmDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: this.translate('common.confirmation.message-unsaved'),
        header: this.translate('common.confirmation.header'),
        icon: 'pi pi-exclamation-triangle',
        rejectButtonStyleClass: 'p-button-text',
        acceptLabel: this.translationService.translate(
          'common.confirmation.accept',
        ),
        rejectLabel: this.translationService.translate(
          'common.confirmation.reject',
        ),
        accept: () => {
          resolve(true);
        },
        reject: () => {
          resolve(false);
        },
      });
    });
  }

  protected translate(key: string) {
    return this.translationService.translate(key);
  }

  private parseExpense() {
    const expense = this.correction.expense;
    if (expense !== null) {
      const day: number = this.parseDays(expense);
      const hour = this.parseHours(expense);
      const minute = this.parseMinutes(expense);
      this.expenseElement = { minute: minute, hour: hour + day * 24 };
    } else {
      this.expenseNotSet = true;
    }
  }

  protected expenseToString(): void {
    const expense = this.expenseElement;
    this.correction.expense = this.expenseNotSet
      ? null
      : `${expense.hour}:${expense.minute}:00`;
  }

  private parseDays(duration: string): number {
    const parts = duration.split(' ');
    if (parts.length > 1) {
      return parseInt(parts[0], 10);
    }
    return 0;
  }

  private parseHours(duration: string): number {
    const timePart = duration.split(' ').pop();
    return parseInt(timePart!.split(':')[0], 10);
  }

  private parseMinutes(duration: string): number {
    const timePart = duration.split(' ').pop();
    return parseInt(timePart!.split(':')[1], 10);
  }

  protected calculateLateSubmission() {
    this.lateSubmissionPenalty =
      (this.course?.lateSubmissionPenalty ?? 0) *
      -this.correction.lateSubmittedDays;
  }

  protected onHasLateSubmittedClick() {
    this.hasLateSubmitted = !this.hasLateSubmitted;
    this.correction.lateSubmittedDays = this.hasLateSubmitted ? 1 : 0;
    this.calculateLateSubmission();
  }

  onBackButtonClick() {
    this.location.back();
  }

  onSaveClick() {
    this.saveCorrectionIfChanged(true);
  }

  onDownloadClick() {
    const downloadAndReturn = () => {
      this.correctionService.downloadCorrection(this.correctionId!);
      this.location.back();
    };
    if (!this.readOnly) {
      this.saveCorrection().subscribe({
        complete: () => {
          downloadAndReturn();
        },
      });
    } else {
      downloadAndReturn();
    }
  }

  onExpenseSetClick() {
    this.expenseNotSet = !this.expenseNotSet;
    this.expenseElement = { hour: 0, minute: 0 };
    this.expenseToString();
  }

  onToggleShowPreviousDeductionClick() {
    this.showPreviousDeductions = !this.showPreviousDeductions;

    if (!this.previousDeductions) {
      this.previousDeductionsService
        .getPreviousDeductions(this.correctionId, 'correction')
        .subscribe({
          next: (value) => {
            this.previousDeductions = value;
          },
          error: (err) => {
            if (err.status === 404) {
              this.toastService.error(
                'course.evaluateView.error-no-deductions',
              );
              this.showPreviousDeductions = false;
            }
          },
        });
    }
  }
}
