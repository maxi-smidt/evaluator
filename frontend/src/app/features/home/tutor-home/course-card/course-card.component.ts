import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { SimpleCourseInstance } from '../../../course/models/course.model';

@Component({
  selector: 'ms-course-card',
  templateUrl: './course-card.component.html',
  styleUrls: ['./course-card.component.css'],
})
export class CourseCardComponent {
  private router = inject(Router);

  public courseInstance = input.required<SimpleCourseInstance>();

  protected onCourseClick(courseId: number) {
    this.router.navigate(['course', 'instance', courseId]).then();
  }
}
