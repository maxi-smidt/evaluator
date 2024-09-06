import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { SimpleCourseInstance } from '../../../course/models/course.model';

@Component({
  selector: 'ms-course-card',
  templateUrl: './course-card.component.html',
  standalone: true,
})
export class CourseCardComponent {
  courseInstance = input.required<SimpleCourseInstance>();

  constructor(private router: Router) {}

  onCourseClick(courseId: number) {
    this.router.navigate(['course', 'instance', courseId]).then();
  }
}
