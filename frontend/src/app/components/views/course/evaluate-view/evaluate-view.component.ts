import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CorrectionService} from "../../../../services/correction.service";
import {Correction} from "../../../../interfaces/correction";
import {ConfirmationService, MenuItem, MenuItemCommandEvent, MessageService} from "primeng/api";
import {FileDownloadService} from "../../../../services/file-download.service";

@Component({
  selector: 'ms-evaluate-view',
  templateUrl: './evaluate-view.component.html',
  styleUrls: ['./evaluate-view.component.css']
})
export class EvaluateViewComponent implements OnInit, OnDestroy {
  expenseDialogVisible: boolean = false;
  intervalId: any;
  courseId: number;
  assignmentId: number;
  studentId: number;
  correction: Correction;
  correctionBefore: Correction;
  contextMenuItems: MenuItem[] | undefined;

  annotationPoints: number = 0;
  subExercisePoints: { [key: string]: number } = {};
  exercisePoints: { [key: string]: number } = {};
  totalPoints: number = 0;

  constructor(private correctionService: CorrectionService,
              private route: ActivatedRoute,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,
              private router: Router,
              private fileDownloadService: FileDownloadService) {
    this.correction = {
      assignmentName: '', assignmentPoints: 0, studentFullName: '', expense: 0, status: '', points: 0,
      draft: {annotations: [], exercise: []}
    };
    this.correctionBefore = this.correction;
    this.studentId = -1;
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
          this.correctionService.downloadCorrection(this.studentId, this.courseId, this.assignmentId).subscribe({
            error: err => {
              this.messageService.add({severity: 'error', summary: 'Error', detail: 'Could not download File'});
            }
          })
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
    this.studentId = this.route.snapshot.params['studentId'];

    this.correctionService.getCorrection(this.studentId, this.courseId, this.assignmentId).subscribe({
      next: correction => {
        this.correction = correction;
        this.correctionBefore = JSON.parse(JSON.stringify(correction));
        this.initPoints();
        this.totalPoints = correction.points;
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
      this.correctionService.saveCorrection(this.studentId, this.courseId, this.assignmentId, this.correction).subscribe({
        next: () => {
          this.correctionBefore = JSON.parse(JSON.stringify(this.correction));
        }
      })
    }
  }

  private initPoints() {
    for (const exc of this.correction.draft.exercise) {
      let excPoints = 0;
      for (const subExc of exc.sub) {
        this.subExercisePoints[subExc.name] = subExc.points;
        excPoints += subExc.points;
      }
      this.exercisePoints[exc.name] = excPoints;
    }
  }

  protected updateSubExercisePoints(points: number, subExerciseName: string, exerciseName: string) {
    this.subExercisePoints[subExerciseName] = points;
    this.updateExercisePoints(exerciseName);
    this.updateTotalPoints();
  }

  protected updateAnnotationPoints(points: number) {
    this.annotationPoints = points;
    this.updateTotalPoints();
  }

  protected updateTotalPoints() {
    this.totalPoints = this.annotationPoints;
    Object.keys(this.exercisePoints).forEach(key => {
      this.totalPoints += this.exercisePoints[key];
    });
  }

  protected updateExercisePoints(exerciseName: string) {
    const subExercises = this.correction.draft.exercise.find(ex => ex.name === exerciseName)!.sub;
    this.exercisePoints[exerciseName] = subExercises.reduce((acc, sub) => {
      return acc + (this.subExercisePoints[sub.name] || 0);
    }, 0);
  }

  protected getTotalExercisePoints(exerciseName: string) {
    return this.correction.draft.exercise.find(ex => ex.name === exerciseName)!
      .sub.reduce((acc, subExercise) => acc + subExercise.points, 0);
  }

  private hasChanged() {
    return JSON.stringify(this.correction) !== JSON.stringify(this.correctionBefore);
  }

  checkChanges() {
    console.log("reached");
    if (!this.hasChanged()) {
      console.log("not changed");
      return true;
    }
    console.log("sollte gehen :(");
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

  showExpenseDialog() {
    this.expenseDialogVisible = true;
  }
}
