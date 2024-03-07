import {Component} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {ButtonModule} from "primeng/button";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";
import {RouterLink, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'ms-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [
    ButtonModule,
    TranslatePipe,
    RouterLink,
    RouterLinkActive
  ]
})
export class HeaderComponent {
  toggleButton: boolean = true;

  constructor(private authService: AuthService) {
  }

  onLogoutBtnClick() {
    this.authService.logout();
  }
}
