import { Component, input, model, OnInit } from '@angular/core';
import { User } from '../../../../../core/models/user.models';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../../core/services/user.service';
import { Button } from 'primeng/button';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { StaffControlComponent } from './staff-control/staff-control.component';
import { TranslationService } from '../../../../../shared/services/translation.service';

@Component({
  selector: 'ms-edit-staff',
  standalone: true,
  imports: [
    MultiSelectModule,
    FormsModule,
    Button,
    TranslatePipe,
    StaffControlComponent,
  ],
  templateUrl: './edit-staff.component.html',
})
export class EditStaffComponent implements OnInit {
  user = input.required<User>();
  courseInstanceId = input.required<number>();

  selectableCourseLeaders: User[] = [];
  selectedCourseLeaders = model.required<User[]>();

  selectableTutors: User[] = [];
  selectedTutors = model.required<User[]>();

  constructor(
    private userService: UserService,
    private translationService: TranslationService,
  ) {}

  ngOnInit() {
    if (this.user().role === 'TUTOR') {
      return;
    }

    this.userService
      .getUsers([`course=${this.courseInstanceId()}`, 'get-dp=true'])
      .subscribe({
        next: (value) => {
          this.pushUsersSeparated(value);
        },
      });
  }

  pushUsersSeparated(users: User[]) {
    users.forEach((user) => {
      if (user.role === 'TUTOR') {
        this.selectableTutors.push(user);
      } else if (user.role === 'COURSE_LEADER') {
        this.selectableCourseLeaders.push(user);
      }
    });
  }

  translate(key: string) {
    return this.translationService.translate(key);
  }
}
