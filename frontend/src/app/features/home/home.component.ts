import { Component, computed, inject } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { Role } from '../../core/models/user.models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { Message } from 'primeng/message';
import { NgComponentOutlet } from '@angular/common';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { DpdHomeComponent } from './dpd-home/dpd-home.component';
import { TutorHomeComponent } from './tutor-home/tutor-home.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-home',
  templateUrl: './home.component.html',
  imports: [TranslatePipe, Message, NgComponentOutlet],
})
export class HomeComponent {
  private userService = inject(UserService);

  protected user = toSignal(this.userService.getUser());
  protected homeComponent = computed(() => {
    if (!this.user()) return undefined;
    switch (this.user()!.role) {
      case Role.TUTOR:
        return TutorHomeComponent;
      case Role.DEGREE_PROGRAM_DIRECTOR:
        return DpdHomeComponent;
      case Role.ADMIN:
        return AdminHomeComponent;
      default:
        return undefined;
    }
  });
}
