import { Routes } from '@angular/router';
import { userAuthGuard } from '../../core/guards/user-auth.guard';
import { CourseComponent } from './course.component';
import { CourseInstanceViewComponent } from './course-instance/course-instance-view/course-instance-view.component';
import { SettingsViewComponent } from './course-instance/settings-view/settings-view.component';
import { CourseViewComponent } from './course-view/course-view.component';
import { CourseInstanceComponent } from './course-instance/course-instance.component';

export const courseRoutes: Routes = [
  {
    path: 'course',
    component: CourseComponent,
    canActivate: [userAuthGuard],
    canActivateChild: [userAuthGuard],
    children: [
      { path: ':courseId', component: CourseViewComponent },
      {
        path: 'instance/:courseId',
        component: CourseInstanceComponent,
        children: [
          { path: '', component: CourseInstanceViewComponent },
          {
            path: 'edit',
            component: SettingsViewComponent,
            canDeactivate: [
              (component: SettingsViewComponent) => component.checkChanges(),
            ],
          },
        ],
      },
    ],
  },
];
