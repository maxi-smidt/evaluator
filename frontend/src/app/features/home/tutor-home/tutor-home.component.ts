import {Component, OnInit} from '@angular/core';
import {UserService} from "../../../core/services/user.service";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";
import {CourseCardComponent} from "./course-card/course-card.component";
import {xSimpleCourseInstance} from "../../course/models/course.model";

@Component({
  selector: 'ms-tutor-home',
  templateUrl: './tutor-home.component.html',
  standalone: true,
  imports: [TranslatePipe, CourseCardComponent]
})
export class TutorHomeComponent implements OnInit {
  courseInstances: xSimpleCourseInstance[] = [];

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.userService.getUserCourses().subscribe({
      next: courseInstances => {
        this.courseInstances = courseInstances;
      }
    });
  }

}
