import {Component, OnInit} from '@angular/core';
import {Exercise} from "../../../../interfaces/exercise";
import {CourseService} from "../../../../services/course.service";
import {ActivatedRoute,} from "@angular/router";
import {TranslationService} from "../../../../services/translation.service";

@Component({
  selector: 'ms-exercise-view',
  templateUrl: './exercise-view.component.html',
  styleUrls: ['./exercise-view.component.css']
})
export class ExerciseViewComponent implements OnInit {
  exercise: Exercise;
  cols: any[];

  constructor(private courseService: CourseService,
              private route: ActivatedRoute,
              private translationService: TranslationService) {
    this.exercise = {
      correctedParticipants: 0,
      dueTo: new Date(),
      id: -1,
      maxParticipants: 0,
      name: '',
      state: '',
      studentExercises: {}
    }
    this.cols = [
      {field: 'lastName', header: this.translate('course.exerciseView.last_name')},
      {field: 'firstName', header: this.translate('course.exerciseView.first_name')},
      {field: 'points', header: this.translate('course.exerciseView.evaluation')},
      {field: 'state', header: this.translate('course.exerciseView.status')},
      {field: 'action', header: this.translate('course.exerciseView.action')}
    ]
  }

  ngOnInit() {
    const courseId = this.route.parent!.snapshot.params['courseId'];
    const assignmentId = this.route.snapshot.params['assignmentId'];

    this.courseService.getFullExercise(Number(courseId), Number(assignmentId)).subscribe({
      next: exercise => {
        this.exercise = exercise;
      }
    });
  }

  private translate(key: string) {
    return this.translationService.translate(key);
  }

  get groupNrs() {
    return Object.keys(this.exercise.studentExercises);
  }

  getSeverity(state: string) {
    switch (state) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'info';
      case 'not submitted':
        return 'danger';
      default:
        return 'warning';
    }
  }

  notSubmittedAction() { //TODO
  }

  editAction() { //TODO
  }

  deleteAction() { //TODO
  }

  downloadAction() { //TODO
  }
}
