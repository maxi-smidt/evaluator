import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'ms-login',
  templateUrl: './login.component.html',
  imports: [TranslatePipe, FormsModule, ButtonModule],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username: string = '';
  password: string = '';
  error: boolean = false;

  onSubmit() {
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        void this.router.navigate(['home']);
      },
      error: () => {
        this.error = true;
      },
    });
  }
}
