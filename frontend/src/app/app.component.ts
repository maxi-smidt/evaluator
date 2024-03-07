import {Component} from '@angular/core';
import {UserService} from "./core/services/user.service";

@Component({
  selector: 'ms-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'frontend';

  constructor(private userService: UserService) {
  }

  isLoggedIn() {
    return this.userService.isAuthenticated;
  }
}
