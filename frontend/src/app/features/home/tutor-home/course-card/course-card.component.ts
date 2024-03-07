import {Component, input} from '@angular/core';
import {Router} from "@angular/router";
import {xSimpleCourseInstance} from "../../../course/models/course.model";

@Component({
  selector: 'ms-course-card',
  templateUrl: './course-card.component.html',
  standalone: true
})
export class CourseCardComponent {
  courseInstance = input.required<xSimpleCourseInstance>();

  constructor(private router: Router) {
  }

  onCourseClick(courseId: number) {
    this.router.navigate(['course', courseId]).then();
  }
}
