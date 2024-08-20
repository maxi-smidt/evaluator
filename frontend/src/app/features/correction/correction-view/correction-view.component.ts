import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {Correction, CorrectionDraft} from "../models/correction.model";
import {CorrectionService} from "../services/correction.service";
import {EvaluateTableComponent} from "./evaluate-table/evaluate-table.component";
import {ContextMenuModule} from "primeng/contextmenu";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";
import {BlockUIModule} from "primeng/blockui";
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";
import {UserService} from "../../../core/services/user.service";
import {tap} from "rxjs";
import {FloatLabelModule} from "primeng/floatlabel";
import {InputTextModule} from "primeng/inputtext";
import {ToggleButtonModule} from "primeng/togglebutton";
import {Student} from "../../course/models/student.model";
import {TranslationService} from "../../../shared/services/translation.service";
import {CourseService} from "../../course/services/course.service";
import {CourseInstance, SerializerType} from "../../course/models/course.model";

@Component({
  selector: 'ms-correction-view',
  templateUrl: './correction-view.component.html',
  standalone: true,
  imports: [
    EvaluateTableComponent,
    ContextMenuModule,
    ConfirmDialogModule,
    TranslatePipe,
    BlockUIModule,
    DialogModule,
    FormsModule,
    FloatLabelModule,
    InputTextModule,
    ToggleButtonModule
  ]
})
export class CorrectionViewComponent implements OnInit, OnDestroy {
  interval: any = 0;
  correctionId: number;

  course: CourseInstance;
  correction: Correction;
  correctionBefore: Correction;
  contextMenuItems: MenuItem[];

  displayLock: boolean = false;
  readOnly: boolean = false;

  expenseElement: { minute: number, hour: number } = {minute: 0, hour: 0};
  expenseNotSet: boolean = false;

  annotationPoints: number = 0;
  pointsDistribution: { [exerciseKey: string]: { [subExerciseKey: string]: number } } = {};

  hasLateSubmitted: boolean = false;
  lateSubmissionPenalty: number = 0;

  constructor(private correctionService: CorrectionService,
              private route: ActivatedRoute,
              private confirmationService: ConfirmationService,
              protected messageService: MessageService,
              private userService: UserService,
              private router: Router,
              private translationService: TranslationService,
              private courseService: CourseService) {
    this.correction = {draft: {} as CorrectionDraft, student: {} as Student, assignment: {points: -1, name: ""}} as Correction;
    this.course = {pointStepSize: 0} as CourseInstance;
    this.correctionBefore = {} as Correction;
    this.correctionId = -1;

    this.contextMenuItems = [
      {
        label: 'Save',
        icon: 'pi pi-fw pi-save',
        command: () => {
          this.saveCorrectionIfChanged(true);
        }
      },
      {
        label: 'Download',
        icon: 'pi pi-fw pi-download',
        command: () => {
          this.saveCorrection().subscribe({
            complete: () => {
              this.correctionService.downloadCorrection(this.correctionId!);
            }
          });
        }
      },
      {
        separator: true
      },
      {
        label: 'Back',
        icon: 'pi pi-fw pi-arrow-left',
        command: () => {
          this.router.navigate(['../../'], {relativeTo: this.route}).then();
        }
      }
    ];
  }

  ngOnInit() {
    this.correctionId = this.route.snapshot.params['correctionId'];

    this.userService.getUser().subscribe({
      next: user => {
        this.correctionService.getCorrection(this.correctionId).subscribe({
          next: correction => {
            this.correction = correction;
            this.hasLateSubmitted = this.correction.lateSubmittedDays > 0;
            this.parseExpense();
            this.correctionBefore = JSON.parse(JSON.stringify(correction));
            this.displayLock = this.correction.status === 'CORRECTED';
            this.readOnly = correction.tutorUsername !== user.username;

            this.courseService.getCourseInstance<CourseInstance>(this.correction.courseInstanceId, SerializerType.NORMAL).subscribe({
              next: course => {
                this.course = course;
                this.calculateLateSubmission();
              }
            });
          },
          complete: () => {
            this.initPoints();
          }
        });
      }
    });

    this.interval = setInterval(() => {
      this.saveCorrectionIfChanged();
    }, 10000);
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private saveCorrection(triggered: boolean = false) {
    return this.correctionService.patchCorrection(this.correctionId!, {
      points: this.totalPoints,
      draft: this.correction.draft,
      expense: this.correction.expense,
      lateSubmittedDays: this.correction.lateSubmittedDays
    }).pipe(
      tap({
        next: (response) => {
          if (triggered) {
            this.messageService.add({severity: 'info', summary: 'Info', detail: this.translate('common.saved')});
          }
          this.correction = response;
          this.parseExpense();
          this.correctionBefore = JSON.parse(JSON.stringify(this.correction));
          this.calculateLateSubmission();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.translate('course.evaluateView.couldNotSave')
          });
          throw error;
        }
      })
    );
  }

  private saveCorrectionIfChanged(triggered: boolean = false) {
    if (this.hasChanged()) {
      this.saveCorrection(triggered).subscribe();
    } else {
      if (triggered) {
        this.messageService.add({severity: 'info', summary: 'Info', detail: this.translate('common.noChangesInfo')});
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
    this.annotationPoints = this.correction.draft.annotations.reduce((acc, entry) => acc + entry.points, 0);
  }

  protected updateSubExercisePoints(points: number, subExerciseName: string, exerciseName: string) {
    this.pointsDistribution[exerciseName][subExerciseName] = points;
  }

  protected updateAnnotationPoints(points: number) {
    this.annotationPoints = points;
  }

  get totalPoints() {
    let totalPoints = this.annotationPoints;
    Object.values(this.pointsDistribution).forEach(subExercises => {
      Object.values(subExercises).forEach(points => {
        totalPoints += points;
      });
    });
    totalPoints += this.lateSubmissionPenalty;
    return totalPoints;
  }

  protected getTotalExercisePoints(exerciseName: string) {
    return this.correction.draft.exercise.find(ex => ex.name === exerciseName)!
      .sub.reduce((acc, subExercise) => acc + subExercise.points, 0);
  }

  protected currentExercisePoints(exerciseName: string) {
    return Object.values(this.pointsDistribution[exerciseName] || {})
      .reduce((acc, points) => acc + points, 0)
  }

  private hasChanged() {
    return JSON.stringify(this.correction) !== JSON.stringify(this.correctionBefore);
  }

  public checkChanges() {
    if (!this.hasChanged()) {
      return true;
    }
    return this.confirmDialog().then(
      result => {
        return result;
      }
    )
  }

  private confirmDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: this.translate('common.confirmDialog.message'),
        header: this.translate('common.confirmDialog.header'),
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

  private translate(key: string) {
    return this.translationService.translate(key);
  }

  private parseExpense() {
    const expense = this.correction.expense;
    if (expense !== null) {
      const day: number = this.parseDays(expense);
      const hour = this.parseHours(expense);
      const minute = this.parseMinutes(expense);
      this.expenseElement = {minute: minute, hour: hour + day * 24};
    } else {
      this.expenseNotSet = true;
    }
  }

  protected expenseToString(): void {
    const expense = this.expenseElement;
    this.correction.expense = this.expenseNotSet ? null : `${expense.hour}:${expense.minute}:00`;
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
    this.lateSubmissionPenalty = (this.course?.lateSubmissionPenalty ?? 0) * -this.correction.lateSubmittedDays;
  }

  protected onHasLateSubmittedClick() {
    this.correction.lateSubmittedDays = this.hasLateSubmitted ? 1 : 0;
    this.calculateLateSubmission();
  }
}
