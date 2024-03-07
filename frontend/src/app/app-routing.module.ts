import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./core/login/login.component";
import {userAuthGuard} from "./core/guards/user-auth.guard";
import {SettingsComponent} from "./features/settings/settings.component";
import {courseRoutes} from "./features/course/course.routing";
import {HomeComponent} from "./features/home/home.component";
import {dpRoutes} from "./features/degree-program/degree-program.routing";

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'home', component: HomeComponent, canActivate: [userAuthGuard]},
  {path: 'settings', component: SettingsComponent, canActivate: [userAuthGuard]},
  {path: 'course/:courseId', children: courseRoutes, canActivate: [userAuthGuard], canActivateChild: [userAuthGuard]},
  {path: 'degree-program/:abbreviation', children: dpRoutes},
  {path: '**', redirectTo: 'home', pathMatch: "full"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
