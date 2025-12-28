import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'ms-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [
    ButtonModule,
    TranslatePipe,
    RouterLink,
    RouterLinkActive,
    ImageModule,
  ],
})
export class HeaderComponent {
  private authService = inject(AuthService);

  toggleButton: boolean = true;

  onLogoutButtonClick() {
    this.authService.logout();
  }
}
