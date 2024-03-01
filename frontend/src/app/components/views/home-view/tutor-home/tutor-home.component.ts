import {Component, OnInit} from '@angular/core';
import {UserService} from "../../../../core/services/user.service";
import {BaseCourse} from "../../../../interfaces/base-course";

@Component({
  selector: 'ms-tutor-home',
  templateUrl: './tutor-home.component.html',
  styleUrl: './tutor-home.component.css'
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
