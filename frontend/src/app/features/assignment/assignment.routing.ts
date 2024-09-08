import { Routes } from '@angular/router';
import { userAuthGuard } from '../../core/guards/user-auth.guard';
import { AssignmentComponent } from './assignment.component';
import { AssignmentInstanceViewComponent } from './assignment-instance-view/assignment-instance-view.component';

export const assignmentRoutes: Routes = [
  {
    path: 'assignment',
    component: AssignmentComponent,
    canActivate: [userAuthGuard],
    canActivateChild: [userAuthGuard],
    children: [
      {
        path: ':assignmentId',
        loadComponent: () =>
          import('./assignment-view/assignment-view.component').then(
            (m) => m.AssignmentViewComponent,
          ),
      },
      {
        path: 'instance/:assignmentId',
        component: AssignmentInstanceViewComponent,
      },
    ],
  },
];
