import { Routes } from '@angular/router';
import { DegreeProgramComponent } from './degree-program.component';
import { userAuthGuard } from '../../core/guards/user-auth.guard';
import { UserFormComponent } from '../../shared/forms/user-form/user-form.component';
import { FullUserListComponent } from '../user/staff-view/full-user-list/full-user-list.component';
import { StaffListComponent } from '../user/staff-view/staff-list/staff-list.component';
import { CourseFormComponent } from '../../shared/forms/course-form/course-form.component';
import { CourseInstanceListComponent } from '../course/courses/course-instance-list/course-instance-list.component';
import { CourseListComponent } from '../course/courses/course-list/course-list.component';
import { ClassGroupListComponent } from './class-group/class-group-list/class-group-list.component';
import { ClassGroupDetailComponent } from './class-group/class-group-detail/class-group-detail.component';
import { ClassGroupFormComponent } from './class-group/class-group-form/class-group-form.component';
import { StudentListComponent } from './student/student-list/student-list.component';
import { StudentFormComponent } from './student/student-form/student-form.component';

export const dpRoutes: Routes = [
  {
    path: '',
    component: DegreeProgramComponent,
    canActivate: [userAuthGuard],
    canActivateChild: [userAuthGuard],
    children: [
      {
        path: 'staff',
        children: [
          { path: 'form', component: UserFormComponent },
          { path: 'no-staff', component: FullUserListComponent },
          { path: 'all', component: StaffListComponent },
        ],
      },
      {
        path: 'courses',
        children: [
          { path: 'form', component: CourseFormComponent },
          { path: 'all', component: CourseListComponent },
          { path: 'instances', component: CourseInstanceListComponent },
        ],
      },
      {
        path: 'class',
        children: [
          { path: 'list', component: ClassGroupListComponent },
          { path: 'form', component: ClassGroupFormComponent },
          { path: ':classGroupId', component: ClassGroupDetailComponent },
        ],
      },
      {
        path: 'student',
        children: [
          { path: 'list', component: StudentListComponent },
          { path: 'form', component: StudentFormComponent },
        ],
      },
    ],
  },
];
