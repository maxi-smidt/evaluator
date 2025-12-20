import { Component, input, model, OnInit } from '@angular/core';
import { Role, User } from '../../../../../core/models/user.models';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../../core/services/user.service';
import { StaffControlComponent } from './staff-control/staff-control.component';
import { TranslationService } from '../../../../../shared/services/translation.service';

@Component({
  selector: 'ms-edit-staff',
  imports: [MultiSelectModule, FormsModule, StaffControlComponent],
  templateUrl: './setting-staff.component.html',
})
export class SettingStaffComponent implements OnInit {
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
    if (this.user().role === Role.TUTOR) {
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
    this.selectableTutors = users.filter((u) => u.role === Role.TUTOR);
    this.selectableCourseLeaders = users.filter(
      (u) => u.role === Role.COURSE_LEADER,
    );
  }

  translate(key: string) {
    return this.translationService.translate(key);
  }
}
