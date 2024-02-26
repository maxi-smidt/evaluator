import {Component, OnInit} from '@angular/core';
import {User} from "../../../interfaces/user";
import {UserService} from "../../../services/user.service";

@Component({
  selector: 'ms-home-view',
  templateUrl: './home-view.component.html',
  styleUrls: ['./home-view.component.css']
})
export class HomeViewComponent implements OnInit {
  user: User;

  constructor(private userService: UserService) {
    this.user = {firstName: '', lastName: '', id: '', role: ''}
  }

  ngOnInit() {
    this.userService.getUser().subscribe({
      next: user => {
        this.user = user;
      }
    });
  }
}
