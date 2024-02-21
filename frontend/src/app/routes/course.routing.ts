import {Routes} from "@angular/router";
import {CourseViewComponent} from "../components/views/course/course-view/course-view.component";
import {userAuthGuard} from "../guards/user-auth.guard";
import {AssignmentViewComponent} from "../components/views/course/assignment-view/assignment-view.component";
import {CourseComponent} from "../components/views/course/course.component";
import {CourseCardComponent} from "../components/views/home-view/course-card/course-card.component";
import {EditViewComponent} from "../components/views/course/edit-view/edit-view.component";
import {EvaluateViewComponent} from "../components/views/course/evaluate-view/evaluate-view.component";

export const courseRoutes: Routes = [{
  path: '',
  component: CourseComponent,
  canActivate: [userAuthGuard],
  canActivateChild: [userAuthGuard],
  children: [
    {path: '', component: CourseViewComponent},
    {path: 'edit', component: EditViewComponent, canDeactivate: [(component: EditViewComponent) => component.checkChanges()]},
    {
      path: 'assignment/:assignmentId',
      children: [
        {path: '', component: AssignmentViewComponent},
        {path: 'evaluate/:studentId', component: EvaluateViewComponent}
      ]
    }
  ]
}]

export const courseComponents = [
  CourseComponent,
  CourseViewComponent,
  CourseCardComponent,
  EditViewComponent,
  AssignmentViewComponent,
  EvaluateViewComponent
]
