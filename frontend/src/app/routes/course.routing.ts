import {Routes} from "@angular/router";
import {CourseViewComponent} from "../components/views/course/course-view/course-view.component";
import {userAuthGuard} from "../guards/user-auth.guard";
import {ExerciseViewComponent} from "../components/views/course/exercise-view/exercise-view.component";
import {CourseComponent} from "../components/views/course/course.component";
import {CourseCardComponent} from "../components/views/home-view/course-card/course-card.component";
import {EditViewComponent} from "../components/views/course/edit-view/edit-view.component";

export const courseRoutes: Routes = [{
  path: '',
  component: CourseComponent,
  canActivate: [userAuthGuard],
  canActivateChild: [userAuthGuard],
  children: [
    {path: '', component: CourseViewComponent},
    {path: 'edit', component: EditViewComponent, canDeactivate: [(component: EditViewComponent) => component.checkChanges()]},
    {path: 'exercise/:assignmentId', component: ExerciseViewComponent}
  ]
}]

export const courseComponents = [
  CourseComponent,
  CourseViewComponent,
  CourseCardComponent,
  EditViewComponent,
  ExerciseViewComponent
]
