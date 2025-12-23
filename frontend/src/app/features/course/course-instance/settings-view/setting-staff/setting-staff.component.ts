import { Component, computed, inject, input, model } from '@angular/core';
import { Role, User } from '../../../../../core/models/user.models';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../../core/services/user.service';
import { StaffControlComponent } from './staff-control/staff-control.component';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

@Component({
  selector: 'ms-edit-staff',
  imports: [
    MultiSelectModule,
    FormsModule,
    StaffControlComponent,
    TranslatePipe,
  ],
  templateUrl: './setting-staff.component.html',
})
export class SettingStaffComponent {
  private readonly userService = inject(UserService);

  public user = input.required<User>();
  public courseInstanceId = input.required<number>();
  public selectedCourseLeaders = model.required<User[]>();
  public selectedTutors = model.required<User[]>();

  private users = toSignal(
    toObservable(this.courseInstanceId).pipe(
      switchMap((id) =>
        this.userService.getUsers([`course=${id}`, 'get-dp=true']),
      ),
    ),
  );

  protected selectableCourseLeaders = computed(() =>
    this.users() ? this.users()!.filter((u) => u.role === Role.TUTOR) : [],
  );
  protected selectableTutors = computed(() =>
    this.users()
      ? this.users()!.filter((u) => u.role === Role.COURSE_LEADER)
      : [],
  );
}
