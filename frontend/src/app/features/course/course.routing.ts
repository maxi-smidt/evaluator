import {Routes} from "@angular/router";
import {userAuthGuard} from "../../core/guards/user-auth.guard";
import {CourseComponent} from "./course.component";
import {CourseViewComponent} from "./course-view/course-view.component";
import {EditViewComponent} from "./edit-view/edit-view.component";
import {AssignmentViewComponent} from "./assignment-view/assignment-view.component";
import {EvaluateViewComponent} from "./evaluate-view/evaluate-view.component";

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
        {path: 'correction/:correctionId', component: EvaluateViewComponent, canDeactivate: [(component: EvaluateViewComponent) => component.checkChanges()]}
      ]
    }
  ]
}]
