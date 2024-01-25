import {Component, OnInit} from '@angular/core';
import {BaseExercise} from "../../../../interfaces/base-exercise";
import {CourseService} from "../../../../services/course.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Course} from "../../../../interfaces/course";

@Component({
  selector: 'ms-course-view',
  templateUrl: './course-view.component.html',
  styleUrls: ['./course-view.component.css']
})
export class CourseViewComponent implements OnInit {
  course: Course;

  constructor(private courseService: CourseService,
              private route: ActivatedRoute,
              private router: Router) {
    this.course = {id: -1, name: '', exercises: []};
  }

  ngOnInit() {
    const courseId = this.route.snapshot.params['courseId'];
    this.courseService.getFullCourse(Number(courseId)).subscribe({
      next: course => {
        this.course = course;
      }
    })
  }

  getExerciseStateClass(bE: BaseExercise) {
    if (bE.correctedParticipants === bE.maxParticipants) {
      return 'list-group-item-primary';
    }

    switch (bE.state) {
      case 'EXPIRED':
        return 'list-group-item-danger';
      case 'INACTIVE':
        return 'list-group-item-secondary';
      default:
        return 'list-group-item-success';
    }
  }

  onListExerciseClick(exercise: BaseExercise) {
    this.router.navigate(['exercise', exercise.id, {courseId: this.course.id}], {relativeTo: this.route}).then();
  }

  onEditBtnClick() {
    this.router.navigate(['edit'], {relativeTo: this.route}).then();
  }

}
