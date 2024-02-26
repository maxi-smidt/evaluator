import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {HomeViewComponent} from "./components/views/home-view/home-view.component";
import {userAuthGuard} from "./guards/user-auth.guard";
import {UserSettingsViewComponent} from "./components/views/user-settings-view/user-settings-view.component";
import {courseRoutes} from "./routes/course.routing";
import {tutorAuthGuard} from "./guards/tutor-auth.guard";

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'home', component: HomeViewComponent, canActivate: [userAuthGuard]},
  {path: 'settings', component: UserSettingsViewComponent, canActivate: [userAuthGuard]},
  {path: 'course/:courseId', children: courseRoutes, canActivate: [tutorAuthGuard], canActivateChild: [tutorAuthGuard]},
  {path: '**', redirectTo: 'home', pathMatch: "full"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
