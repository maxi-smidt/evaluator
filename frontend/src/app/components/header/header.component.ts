import {Component, Input} from '@angular/core';
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'ms-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input()
  isSuperUserLoggedIn: boolean = false;

  constructor(private authService: AuthService) {
  }

  onLogoutBtnClick() {
    this.authService.logout();
  }
}
