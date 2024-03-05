import {Component, OnInit} from '@angular/core';
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {DegreeProgramListComponent} from "./degree-program-list/degree-program-list.component";
import {UserListComponent} from "./user-list/user-list.component";
import {DegreeProgramFormComponent} from "./degree-program-form/degree-program-form.component";
import {UserFormComponent} from "../../../shared/forms/user-form/user-form.component";
import {TranslationService} from "../../../shared/services/translation.service";

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
export class AdminHomeComponent implements OnInit {
  userFormChoices: string[] = [];

  constructor(private translationService: TranslationService) {
  }


  ngOnInit() {
    this.userFormChoices = this.translationService.getArray('home.adminHome.role-choices');
  }
}
