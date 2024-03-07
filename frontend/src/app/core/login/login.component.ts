import {Component} from '@angular/core';
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";
import {TranslatePipe} from "../../shared/pipes/translate.pipe";
import {FormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";

@Component({
  selector: 'ms-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    TranslatePipe,
    FormsModule,
    ButtonModule
  ]
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {
  }

  onSubmit() {
    this.authService.login(this.username, this.password)
      .subscribe({
        next: () => {
          this.router.navigate(['home']).then();
        },
        error: (err) => {
          console.error('Login error:', err);
        }
      });
  }
}
