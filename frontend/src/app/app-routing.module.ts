import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./core/login/login.component";
import {userAuthGuard} from "./core/guards/user-auth.guard";
import {SettingsComponent} from "./features/settings/settings.component";
import {courseRoutes} from "./features/course/course.routing";
import {tutorAuthGuard} from "./core/guards/tutor-auth.guard";
import {HomeComponent} from "./features/home/home.component";

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'home', component: HomeComponent, canActivate: [userAuthGuard]},
  {path: 'settings', component: SettingsComponent, canActivate: [userAuthGuard]},
  {path: 'course/:courseId', children: courseRoutes, canActivate: [tutorAuthGuard], canActivateChild: [tutorAuthGuard]},
  {path: '**', redirectTo: 'home', pathMatch: "full"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
