import {Component, OnInit} from '@angular/core';
import {UserService} from "../../../core/services/user.service";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";
import {CourseCardComponent} from "./course-card/course-card.component";
import {BaseCourse} from "../../course/models/course.models";

@Component({
  selector: 'ms-tutor-home',
  templateUrl: './tutor-home.component.html',
  standalone: true,
  imports: [TranslatePipe, CourseCardComponent]
})
export class TutorHomeComponent implements OnInit {
  baseCourses: BaseCourse[] = [];

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.userService.getUserCourses().subscribe({
      next: baseCourses => {
        this.baseCourses = baseCourses;
      }
    });
  }

}
