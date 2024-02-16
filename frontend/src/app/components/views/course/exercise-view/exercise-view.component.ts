import {Component, OnInit} from '@angular/core';
import {Exercise} from "../../../../interfaces/exercise";
import {CourseService} from "../../../../services/course.service";
import {ActivatedRoute, Router} from "@angular/router";

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
              private router: Router) {
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
      {field: 'lastName', header: 'Nachname'},
      {field: 'firstName', header: 'Vorname'},
      {field: 'points', header: 'Bewertung'},
      {field: 'state', header: 'Status'},
      {field: 'action', header: 'Action'}
    ];
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
