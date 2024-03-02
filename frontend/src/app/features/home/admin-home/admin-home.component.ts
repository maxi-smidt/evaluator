import {Component} from '@angular/core';
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {AppModule} from "../../../app.module";
import {DegreeProgramListComponent} from "./degree-program-list/degree-program-list.component";
import {UserListComponent} from "./user-list/user-list.component";
import {DegreeProgramFormComponent} from "./degree-program-form/degree-program-form.component";
import {UserFormComponent} from "./user-form/user-form.component";

@Component({
  selector: 'ms-admin-home',
  templateUrl: './admin-home.component.html',
  standalone: true,
  imports: [
    ToastModule,
    ConfirmDialogModule,
    DegreeProgramListComponent,
    UserListComponent,
    DegreeProgramFormComponent,
    UserFormComponent
  ]
})
export class AdminHomeComponent {
}
