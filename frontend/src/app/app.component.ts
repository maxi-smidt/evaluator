import {Component, OnInit} from '@angular/core';
import {AuthService} from "./services/auth.service";
import {TranslationService} from "./services/translation.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'frontend';

  constructor(private authService: AuthService,
              private translationService: TranslationService) {
  }

  ngOnInit() {
    this.translationService.loadLanguage('de').subscribe();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isSuperUserLoggedIn(): boolean {
    return this.authService.isSuperLoggedIn();
  }
}
