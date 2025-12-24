import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import {
  Correction,
  CorrectionStatus,
  Entry,
  Exercise,
} from '../models/correction.model';
import { CorrectionService } from '../services/correction.service';
import { EvaluateTableComponent } from './evaluate-table/evaluate-table.component';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { combineLatest, filter, interval, map, switchMap, tap } from 'rxjs';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TranslationService } from '../../../shared/services/translation.service';
import { CourseService } from '../../course/services/course.service';
import {
  CourseInstance,
  SerializerType,
} from '../../course/models/course.model';
import { ToastService } from '../../../shared/services/toast.service';
import { PreviousDeductionsService } from '../../previous-deductions/services/previous-deductions.service';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { ExerciseGroupComponent } from './exercise-group/exercise-group.component';
import { PreviousDeductions } from '../../previous-deductions/models/previous-deduction.model';

@Component({
  selector: 'ms-correction-view',
  templateUrl: './correction-view.component.html',
  styleUrls: ['./correction-view.component.css'],
  imports: [
    EvaluateTableComponent,
    ContextMenuModule,
    ConfirmDialogModule,
    TranslatePipe,
    DialogModule,
    FormsModule,
    FloatLabelModule,
    InputTextModule,
    Button,
    Tooltip,
    ExerciseGroupComponent,
  ],
})
export class CorrectionViewComponent {
  private readonly correctionService = inject(CorrectionService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly userService = inject(UserService);
  private readonly location = inject(Location);
  private readonly translationService = inject(TranslationService);
  private readonly courseService = inject(CourseService);
  private readonly previousDeductionsService = inject(
    PreviousDeductionsService,
  );

  private correctionId$ = this.route.params.pipe(
    map((params) => Number(params['correctionId'])),
  );
  protected correctionId = toSignal(this.correctionId$);
  private user = toSignal(this.userService.getUser());
  protected serverStateCorrection = toSignal(
    combineLatest([this.correctionId$, toObservable(this.user)]).pipe(
      switchMap(([id, _]) =>
        this.correctionService.getCorrection(id).pipe(
          tap({
            error: () => this.location.back(),
          }),
        ),
      ),
    ),
  );
  protected draftStateCorrection = signal<Correction | undefined>(undefined);
  private baselineStateCorrection = signal<Correction | undefined>(undefined);
  protected course = toSignal(
    toObservable(this.serverStateCorrection).pipe(
      filter((correction) => !!correction?.courseInstanceId),
      switchMap((correction) =>
        this.courseService.getCourseInstance<CourseInstance>(
          correction!.courseInstanceId,
          SerializerType.NORMAL,
        ),
      ),
    ),
  );
  protected readOnly = computed(
    () =>
      this.serverStateCorrection()?.status === CorrectionStatus.CORRECTED ||
      this.serverStateCorrection()?.tutorUsername !== this.user()?.username,
  );
  protected expense = signal({ hours: 0, minutes: 0 });
  protected expenseNotSet = signal(false);
  protected lateSubmissionPenalty = computed(
    () =>
      (this.course()?.lateSubmissionPenalty ?? 0) *
      -(this.draftStateCorrection()?.lateSubmittedDays ?? 0),
  );
  protected hasLateSubmitted = computed(
    () => (this.draftStateCorrection()?.lateSubmittedDays ?? 0) > 0,
  );
  protected isDirty = computed(() => {
    return (
      JSON.stringify(this.draftStateCorrection()) !==
      JSON.stringify(this.baselineStateCorrection())
    );
  });
  protected currentPoints = computed(() => {
    const draftStateCorrection = this.draftStateCorrection();
    if (!draftStateCorrection) return undefined;
    return (
      this.getCurrentPoints(draftStateCorrection) + this.lateSubmissionPenalty()
    );
  });
  protected totalPoints = computed(() => {
    return (
      this.serverStateCorrection()?.draft.exercise.reduce(
        (outerAcc, currentValue) =>
          outerAcc +
          currentValue.sub.reduce(
            (innerAcc, subExercise) => innerAcc + subExercise.points,
            0,
          ),
        0,
      ) ?? 0
    );
  });

  protected readonly showPreviousDeductions = signal<boolean>(false);
  protected readonly previousDeductions = signal<
    PreviousDeductions | undefined
  >(undefined);

  constructor() {
    effect(() => {
      const data = this.serverStateCorrection();
      const currentDraft = untracked(() => this.draftStateCorrection());
      if (data && (!currentDraft || currentDraft?.id !== data.id)) {
        this.draftStateCorrection.set(structuredClone(data));
        this.baselineStateCorrection.set(structuredClone(data));
        this.parseExpense();
      }
    });

    effect(() => {
      const expense = this.expenseNotSet()
        ? null
        : `${this.expense().hours}:${this.expense().minutes}:00`;
      this.draftStateCorrection.update((current) => ({
        ...current!,
        expense: expense,
      }));
    });

    interval(10000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (!this.readOnly()) {
          this.saveCorrectionIfChanged();
        }
      });
  }

  private getCurrentPoints(correction: Correction) {
    let currentPoints = 0;

    for (const exc of correction.draft.exercise) {
      for (const subExc of exc.sub) {
        currentPoints += subExc.notes.reduce(
          (acc, note) => acc + note.points,
          subExc.points,
        );
      }
    }
    currentPoints += correction.draft.annotations.reduce(
      (acc, entry) => acc + entry.points,
      0,
    );
    return currentPoints;
  }

  private saveCorrection(
    triggered: boolean = false,
    callback: (() => void) | null = null,
  ) {
    const payload = this.draftStateCorrection();
    if (!payload) return;
    return this.correctionService
      .patchCorrection(this.correctionId()!, {
        points: this.currentPoints() ?? 0,
        draft: payload.draft,
        expense: payload.expense,
        lateSubmittedDays: payload.lateSubmittedDays,
      })
      .subscribe({
        next: () => {
          if (triggered) {
            this.toastService.info('common.saved');
          }
          this.baselineStateCorrection.set(structuredClone(payload));
        },
        error: () => {
          this.toastService.error('course.evaluateView.couldNotSave');
        },
        complete: () => callback?.(),
      });
  }

  private saveCorrectionIfChanged(manuallyTriggered: boolean = false) {
    if (this.isDirty()) {
      this.saveCorrection(manuallyTriggered);
    } else {
      if (manuallyTriggered) {
        this.toastService.info('common.noChangesInfo');
      }
    }
  }

  public checkChanges() {
    if (!this.isDirty()) {
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
    const expense = this.serverStateCorrection()?.expense;
    if (expense) {
      const day: number = this.parseDays(expense);
      const hour = this.parseHours(expense);
      const minute = this.parseMinutes(expense);
      this.expense.set({ minutes: minute, hours: hour + day * 24 });
    } else {
      this.expenseNotSet.set(true);
    }
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

  protected onHasLateSubmittedClick() {
    const updatedDays =
      this.draftStateCorrection()!.lateSubmittedDays > 0 ? 0 : 1;
    this.draftStateCorrection.update((current) => ({
      ...current!,
      lateSubmittedDays: updatedDays,
    }));
  }

  protected onBackButtonClick() {
    this.location.back();
  }

  protected onSaveClick() {
    this.saveCorrectionIfChanged(true);
  }

  protected onDownloadClick() {
    const downloadAndReturn = () => {
      this.correctionService
        .downloadCorrection(this.correctionId()!)
        .subscribe({ next: () => this.location.back() });
    };
    if (!this.readOnly()) {
      this.saveCorrection(false, downloadAndReturn);
    } else {
      downloadAndReturn();
    }
  }

  protected onExpenseSetClick() {
    this.expenseNotSet.update((current) => !current);
    this.expense.update(() => ({ hours: 0, minutes: 0 }));
  }

  protected onToggleShowPreviousDeductionClick() {
    this.showPreviousDeductions.update((current) => !current);

    if (!this.previousDeductions()) {
      this.previousDeductionsService
        .getPreviousDeductions(this.correctionId()!, 'correction')
        .subscribe({
          next: (value) => {
            this.previousDeductions.set(value);
          },
          error: (err) => {
            if (err.status === 404) {
              this.toastService.error(
                'course.evaluateView.error-no-deductions',
              );
              this.showPreviousDeductions.set(false);
            }
          },
        });
    }
  }

  protected updateLateDays(days: number) {
    this.draftStateCorrection.update((current) => {
      if (!current) return;
      return {
        ...current,
        lateSubmittedDays: days,
      };
    });
  }

  protected updateAnnotations(updatedAnnotations: Entry[]) {
    this.draftStateCorrection.update((current) => {
      if (!current) return undefined;
      return {
        ...current,
        draft: { ...current.draft, annotations: updatedAnnotations },
      };
    });
  }

  protected updateExercise(index: number, updatedExercise: Exercise) {
    this.draftStateCorrection.update((current) => {
      if (!current) return undefined;
      const newExercises = [...current.draft.exercise];
      newExercises[index] = updatedExercise;
      return {
        ...current,
        draft: { ...current.draft, exercise: newExercises },
      };
    });
  }
}
