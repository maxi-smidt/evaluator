import { Component, inject, OnInit, Type } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { Role, User } from '../../core/models/user.models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { Message } from 'primeng/message';
import { NgComponentOutlet } from '@angular/common';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { DpdHomeComponent } from './dpd-home/dpd-home.component';
import { TutorHomeComponent } from './tutor-home/tutor-home.component';

@Component({
  selector: 'ms-home',
  templateUrl: './home.component.html',
  imports: [TranslatePipe, Message, NgComponentOutlet],
})
export class HomeComponent implements OnInit {
  private userService = inject(UserService);

  protected homeComponent?: Type<
    DpdHomeComponent | AdminHomeComponent | TutorHomeComponent
  >;
  protected user?: User;

  public ngOnInit() {
    this.userService.getUser().subscribe({
      next: (value) => {
        this.user = value;
        this.loadHomeComponent().then();
      },
    });
  }

  private async loadHomeComponent() {
    switch (this.user?.role) {
      case Role.TUTOR: {
        this.homeComponent = TutorHomeComponent;
        break;
      }
      case Role.DEGREE_PROGRAM_DIRECTOR: {
        this.homeComponent = DpdHomeComponent;
        break;
      }
      case Role.ADMIN: {
        this.homeComponent = AdminHomeComponent;
        break;
      }
      default:
        this.homeComponent = undefined;
    }
  }
}
