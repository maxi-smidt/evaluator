import {Component, OnInit} from '@angular/core';
import {Assignment} from "../../../../interfaces/assignment";
import {CourseService} from "../../../../services/course.service";
import {ActivatedRoute, Router,} from "@angular/router";
import {TranslationService} from "../../../../services/translation.service";
import {CorrectionService} from "../../../../services/correction.service";

@Component({
  selector: 'ms-assignment-view',
  templateUrl: './assignment-view.component.html',
  styleUrls: ['./assignment-view.component.css']
})
export class AssignmentViewComponent implements OnInit {
  assignment: Assignment;
  cols: any[];
  targetIdx: number;
  assignmentId: number;
  courseId: number;

  constructor(private courseService: CourseService,
              private route: ActivatedRoute,
              private translationService: TranslationService,
              private correctionService: CorrectionService,
              private router: Router) {
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
    this.targetIdx = 0;
    this.assignmentId = -1;
    this.courseId = -1;
  }

  ngOnInit() {
    this.courseId = this.route.parent!.parent!.snapshot.params['courseId'];
    this.assignmentId = this.route.parent!.snapshot.params['assignmentId'];

    this.courseService.getFullExercise(this.courseId, this.assignmentId).subscribe({
      next: assignment => {
        this.assignment = assignment;
      }
    });
  }

  private translate(key: string) {
    return this.translationService.translate(key);
  }

  get groupNrs() {
    return Object.keys(this.assignment.studentExercises);
  }

  getSeverity(state: string) {
    switch (state) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'info';
      case 'NOT_SUBMITTED':
        return 'danger';
      default:
        return 'warning';
    }
  }

  onStudentClick(studentId: number) {
    this.router.navigate(['evaluate', studentId], {relativeTo: this.route}).then();
  }

  notSubmittedAction(studentId: number) {
    this.correctionService.setCorrectionNotSubmitted(studentId, this.courseId, this.assignmentId).subscribe({
      next: assignment => {
        this.assignment = assignment;
      }
    });
  }

  editAction() { //TODO
  }

  deleteAction(studentId: number) {
    this.correctionService.deleteCorrection(studentId, this.courseId, this.assignmentId).subscribe({
      next: assignment => {
        this.assignment = assignment;
      }
    })
  }

  downloadAction() { //TODO
  }
}
