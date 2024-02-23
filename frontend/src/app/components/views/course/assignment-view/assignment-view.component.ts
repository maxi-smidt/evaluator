import {Component, OnInit} from '@angular/core';
import {Assignment} from "../../../../interfaces/assignment";
import {CourseService} from "../../../../services/course.service";
import {ActivatedRoute, Router,} from "@angular/router";
import {TranslationService} from "../../../../services/translation.service";
import {CorrectionService} from "../../../../services/correction.service";
import {ConfirmationService} from "primeng/api";

@Component({
  selector: 'ms-assignment-view',
  templateUrl: './assignment-view.component.html',
  styleUrls: ['./assignment-view.component.css']
})
export class AssignmentViewComponent implements OnInit {
  assignment: Assignment;
  cols: any[];
  groups: string[];
  targetGroups: number[];
  assignmentId: number;
  courseId: number;

  constructor(private courseService: CourseService,
              private route: ActivatedRoute,
              private translationService: TranslationService,
              private correctionService: CorrectionService,
              private router: Router,
              private confirmationService: ConfirmationService) {
    this.assignment = {
      correctedParticipants: 0,
      dueTo: new Date(),
      id: -1,
      maxParticipants: 0,
      name: '',
      state: '',
      studentExercises: {}
    }
    this.cols = [
      {field: 'lastName', header: this.translate('course.assignmentView.last_name')},
      {field: 'firstName', header: this.translate('course.assignmentView.first_name')},
      {field: 'points', header: this.translate('course.assignmentView.evaluation')},
      {field: 'state', header: this.translate('course.assignmentView.status')},
      {field: 'action', header: this.translate('course.assignmentView.action')}
    ]
    this.targetGroups = [];
    this.groups = [];
    this.assignmentId = -1;
    this.courseId = -1;
  }

  ngOnInit() {
    this.courseId = this.route.parent!.parent!.snapshot.params['courseId'];
    this.assignmentId = this.route.parent!.snapshot.params['assignmentId'];

    this.courseService.getFullExercise(this.courseId, this.assignmentId).subscribe({
      next: value => {
        this.assignment = value.assignment;
        this.targetGroups = value.targetGroups;
        this.groups = Object.keys(this.assignment.studentExercises);
        this.adjustTargetGroupsToIndex();
      }
    });
  }

  private translate(key: string) {
    return this.translationService.translate(key);
  }

  private adjustTargetGroupsToIndex() {
    this.targetGroups.forEach((value, index, arr) => {
      arr[index] = value - 1;
    });
  }

  getSeverity(state: string) {
    switch (state) {
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

  onStudentClick(studentId: number, state: string) {
    if (state !== 'CORRECTED' && state !== 'NOT_SUBMITTED') {
      this.router.navigate(['evaluate', studentId], {relativeTo: this.route}).then();
    }
  }

  notSubmittedAction(studentId: number) {
    this.correctionService.setCorrectionState(studentId, this.courseId, this.assignmentId, 'NOT_SUBMITTED').subscribe({
      next: assignment => {
        this.assignment = assignment;
      }
    });
  }

  editAction(studentId: number) {
    this.correctionService.setCorrectionState(studentId, this.courseId, this.assignmentId, 'IN_PROGRESS').subscribe({
      next: () => {
        this.router.navigate(['evaluate', studentId], {relativeTo: this.route}).then();
      }
    });
  }

  deleteAction(studentId: number) {
    this.confirmDialog().then(
      result => {
        if (result) {
          this.correctionService.deleteCorrection(studentId, this.courseId, this.assignmentId).subscribe({
            next: assignment => {
              this.assignment = assignment;
            }
          });
        }
      }
    );
  }

  downloadAction(studentId: number) {
    this.correctionService.downloadCorrection(studentId, this.courseId, this.assignmentId);
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
