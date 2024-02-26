import {Component, Input} from '@angular/core';
import {Router} from "@angular/router";
import {BaseCourse} from "../../../../../interfaces/base-course";

@Component({
  selector: 'ms-course-card',
  templateUrl: './course-card.component.html',
  styleUrls: ['./course-card.component.css']
})
export class CourseCardComponent {
  @Input()
  baseCourse: BaseCourse;

  constructor(private router: Router) {
    this.baseCourse = {id: -1, name: "not_found"};
  }

  onCourseClick(courseId: number) {
    this.router.navigate(['course', courseId]).then();
  }
}
