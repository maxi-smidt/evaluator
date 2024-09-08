import { Component, OnInit, Type } from '@angular/core';
import { User } from '../../core/models/user.models';
import { UserService } from '../../core/services/user.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { NgComponentOutlet } from '@angular/common';
import { DpdHomeComponent } from './dpd-home/dpd-home.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { TutorHomeComponent } from './tutor-home/tutor-home.component';

@Component({
  selector: 'ms-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [TranslatePipe, NgComponentOutlet],
})
export class HomeComponent implements OnInit {
  homeComponent:
    | Type<DpdHomeComponent | AdminHomeComponent | TutorHomeComponent>
    | undefined;
  user: User;

  constructor(private userService: UserService) {
    this.user = { firstName: '', lastName: '', username: '', role: '' };
  }

  ngOnInit() {
    this.userService.getUser().subscribe({
      next: (value) => {
        this.user = value;
        this.loadHomeComponent().then();
      },
    });
  }

  async loadHomeComponent() {
    switch (this.user.role) {
      case 'TUTOR': {
        const { TutorHomeComponent } = await import(
          './tutor-home/tutor-home.component'
        );
        this.homeComponent = TutorHomeComponent;
        break;
      }
      case 'DEGREE_PROGRAM_DIRECTOR': {
        const { DpdHomeComponent } = await import(
          './dpd-home/dpd-home.component'
        );
        this.homeComponent = DpdHomeComponent;
        break;
      }
      case 'ADMIN': {
        const { AdminHomeComponent } = await import(
          './admin-home/admin-home.component'
        );
        this.homeComponent = AdminHomeComponent;
        break;
      }
      default:
        this.homeComponent = undefined;
    }
  }
}
