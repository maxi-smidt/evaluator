import {Component, OnInit} from '@angular/core';
import {User} from "../../../interfaces/user";
import {UserService} from "../../../services/user.service";
import {BaseCourse} from "../../../interfaces/base-course";
import {Router} from "@angular/router";

@Component({
  selector: 'ms-home-view',
  templateUrl: './home-view.component.html',
  styleUrls: ['./home-view.component.css']
})
export class HomeViewComponent implements OnInit {
  user: User;
  baseCourses: BaseCourse[];

  constructor(private userService: UserService,
              private router: Router) {
    this.user = {firstName: '', lastName: '', sNumber: ''}
    this.baseCourses = [];
  }

  ngOnInit() {
    this.userService.getUser().subscribe({
      next: user => {
        this.user = user;
      }
    })

    this.userService.getUserCourses().subscribe({
      next: baseCourses => {
        this.baseCourses = baseCourses;
      }
    })
  }
}
