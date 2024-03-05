import {Component, OnInit} from '@angular/core';
import {User} from "../../core/models/user.models";
import {UserService} from "../../core/services/user.service";
import {TranslatePipe} from "../../shared/pipes/translate.pipe";
import {TutorHomeComponent} from "./tutor-home/tutor-home.component";
import {AdminHomeComponent} from "./admin-home/admin-home.component";
import {DpdHomeComponent} from "./dpd-home/dpd-home.component";


@Component({
  selector: 'ms-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    TranslatePipe,
    TutorHomeComponent,
    AdminHomeComponent,
    DpdHomeComponent
  ]
})
export class HomeComponent implements OnInit {
  user: User;

  constructor(private userService: UserService) {
    this.user = {firstName: '', lastName: '', username: '', role: ''}
  }

  ngOnInit() {
    this.userService.getUser().subscribe({
      next: value => {
        this.user = value;
      }
    });
  }
}
