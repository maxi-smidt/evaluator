import {Component} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'ms-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  s_number: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {
  }

  onSubmit() {
    this.authService.login(this.s_number, this.password)
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
