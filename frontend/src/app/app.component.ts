import {Component, OnInit} from '@angular/core';
import {TranslationService} from "./shared/services/translation.service";
import {UserService} from "./core/services/user.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'frontend';

  constructor(private userService: UserService,
              private translationService: TranslationService) {
  }

  ngOnInit() {
    this.translationService.loadLanguage('de').subscribe();
  }

  isLoggedIn() {
    return this.userService.isAuthenticated;
  }
}
