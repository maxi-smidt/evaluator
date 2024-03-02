import {Component, input, Input} from '@angular/core';
import {Router} from "@angular/router";
import {BaseCourse} from "../../../course/models/course.models";

@Component({
  selector: 'ms-course-card',
  templateUrl: './course-card.component.html',
  standalone: true
})
export class CourseCardComponent {
  baseCourse = input.required<BaseCourse>();

  constructor(private router: Router) {
  }

  onCourseClick(courseId: number) {
    this.router.navigate(['course', courseId]).then();
  }
}
