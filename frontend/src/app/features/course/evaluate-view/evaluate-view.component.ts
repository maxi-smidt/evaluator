import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {Correction} from "../models/correction.model";
import {CorrectionService} from "../services/correction.service";
import {EvaluateTableComponent} from "./evaluate-table/evaluate-table.component";
import {ContextMenuModule} from "primeng/contextmenu";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToastModule} from "primeng/toast";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";
import {BlockUIModule} from "primeng/blockui";
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'ms-evaluate-view',
  templateUrl: './evaluate-view.component.html',
  standalone: true,
  imports: [
    EvaluateTableComponent,
    ContextMenuModule,
    ConfirmDialogModule,
    ToastModule,
    TranslatePipe,
    BlockUIModule,
    DialogModule,
    FormsModule
  ]
})
export class EvaluateViewComponent implements OnInit, OnDestroy {
  expenseDialogVisible: boolean = false;
  intervalId: any;
  courseId: number;
  assignmentId: number;
  correctionId: number | undefined;
  correction: Correction;
  correctionBefore: Correction;
  contextMenuItems: MenuItem[];
  displayLock: boolean = false;

  annotationPoints: number = 0;
  pointsDistribution: { [exerciseKey: string]: { [subExerciseKey: string]: number } } = {};

  constructor(private correctionService: CorrectionService,
              private route: ActivatedRoute,
              private confirmationService: ConfirmationService,
              protected messageService: MessageService,
              private router: Router) {
    this.correction = {} as any;
    this.correctionBefore = {} as any;
    this.assignmentId = -1;
    this.courseId = -1;

    this.contextMenuItems = [
      {
        label: 'Save',
        icon: 'pi pi-fw pi-save',
        command: () => {
          this.saveCorrection();
          this.messageService.add({severity: 'info', summary: 'Info', detail: 'Saved'});
        }
      },
      {
        label: 'Expense',
        icon: 'pi pi-fw pi-clock',
        command: () => {
          this.showExpenseDialog();
        }
      },
      {
        label: 'Download',
        icon: 'pi pi-fw pi-download',
        command: () => {
          //this.correctionService.downloadCorrection(this.studentId, this.courseId, this.assignmentId);
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
    this.courseId = this.route.parent!.parent!.snapshot.params['courseId'];
    this.assignmentId = this.route.parent!.snapshot.params['assignmentId'];
    this.correctionId = this.route.snapshot.params['correctionId'];

    this.correctionService.getCorrection(this.correctionId!).subscribe({
      next: value => {
        console.log(value);
        this.correction = value;
        this.correctionBefore = JSON.parse(JSON.stringify(value));
        //this.displayLock = value.lock;
        this.initPoints();
      }
    });

    this.intervalId = setInterval(() => {
      this.saveCorrection();
    }, 10000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private saveCorrection() {
    if (this.hasChanged()) {
      this.correction.points = this.totalPoints;
      this.correctionService.patchCorrection(this.correctionId!, {points: this.totalPoints, draft: this.correction.draft}).subscribe({
        next: () => {
          this.correctionBefore = JSON.parse(JSON.stringify(this.correction));
        },
        error: err => {
          this.messageService.add({severity: 'error', summary: 'Error', detail: 'Could not save correction'});
        }
      })
    }
  }

  private initPoints() {
    for (const exc of this.correction.draft.exercise) {
      this.pointsDistribution[exc.name] = {};
      for (const subExc of exc.sub) {
        let points = subExc.notes.reduce((acc, note) => acc + note.points, 0);
        this.pointsDistribution[exc.name][subExc.name] = subExc.points + points;
      }
    }
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
        message: 'You have unsaved changes, are you sure you want to proceed?',
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

  private showExpenseDialog() {
    this.expenseDialogVisible = true;
  }

  onBlockBackClick() {
    this.router.navigate(['../../'], {relativeTo: this.route}).then();
  }
}