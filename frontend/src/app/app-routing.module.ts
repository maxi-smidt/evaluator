import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './core/login/login.component';
import { userAuthGuard } from './core/guards/user-auth.guard';
import { courseRoutes } from './features/course/course.routing';
import { HomeComponent } from './features/home/home.component';
import { dpRoutes } from './features/degree-program/degree-program.routing';
import { LayoutComponent } from './core/layout/layout.component';
import { CorrectionViewComponent } from './features/correction/correction-view/correction-view.component';
import { assignmentRoutes } from './features/assignment/assignment.routing';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivateChild: [userAuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      {
        path: 'plag-scan',
        loadComponent: () =>
          import('./features/plag-scan/plag-scan.component').then(
            (m) => m.PlagScanComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/user/settings-view/settings-view.component').then(
            (m) => m.SettingsViewComponent,
          ),
      },
      {
        path: 'report',
        loadComponent: () =>
          import('./features/report/report.component').then(
            (m) => m.ReportComponent,
          ),
      },
      { path: 'degree-program/:abbreviation', children: dpRoutes },
      {
        path: 'correction/:correctionId',
        loadComponent: () =>
          import('./features/correction/correction-view/correction-view.component').then(
            (m) => m.CorrectionViewComponent,
          ),
        canDeactivate: [
          (component: CorrectionViewComponent) => component.checkChanges(),
        ],
      },
      ...courseRoutes,
      ...assignmentRoutes,
    ],
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
