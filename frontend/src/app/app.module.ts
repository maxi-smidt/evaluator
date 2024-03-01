import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './components/login/login.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HomeViewComponent} from './components/views/home-view/home-view.component';
import {JwtInterceptor} from "./interceptors/jwt.interceptor";
import {HeaderComponent} from './components/header/header.component';
import {UserSettingsViewComponent} from './components/views/user-settings-view/user-settings-view.component';
import {courseComponents} from "./routes/course.routing";
import {BreadcrumbModule} from "primeng/breadcrumb";
import {BadgeModule} from "primeng/badge";
import {TableModule} from "primeng/table";
import {AccordionModule} from "primeng/accordion";
import {DataViewModule} from "primeng/dataview";
import {TagModule} from "primeng/tag";
import {ButtonModule} from "primeng/button";
import {EditViewComponent} from './components/views/course/edit-view/edit-view.component';
import {DragDropModule} from "primeng/dragdrop";
import {ConfirmationService, MessageService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToastModule} from "primeng/toast";
import {TranslatePipe} from './pipes/translate.pipe';
import {TranslationService} from "./services/translation.service";
import {EvaluateViewComponent} from './components/views/course/evaluate-view/evaluate-view.component';
import {EvaluateTableComponent} from "./components/views/course/evaluate-view/evaluate-table/evaluate-table.component";
import {EditorModule} from 'primeng/editor';
import {InputNumberModule} from "primeng/inputnumber";
import {KnobModule} from "primeng/knob";
import {SpeedDialModule} from "primeng/speeddial";
import {ContextMenuModule} from "primeng/contextmenu";
import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";
import {EditGroupComponent} from "./components/views/course/edit-view/edit-group/edit-group.component";
import {EditPartitionComponent} from "./components/views/course/edit-view/edit-partition/edit-partition.component";
import {MultiSelectModule} from "primeng/multiselect";
import {TutorHomeComponent} from "./components/views/home-view/tutor-home/tutor-home.component";
import {AdminHomeComponent} from "./components/views/home-view/admin-home/admin-home.component";
import {UserFormComponent} from "./components/views/home-view/admin-home/user-form/user-form.component";
import {UserListComponent} from "./components/views/home-view/admin-home/user-list/user-list.component";
import {
  DegreeProgramFormComponent
} from "./components/views/home-view/admin-home/degree-program-form/degree-program-form.component";
import {
  DegreeProgramListComponent
} from "./components/views/home-view/admin-home/degree-program-list/degree-program-list.component";
import {BlockUIModule} from "primeng/blockui";

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    LoginComponent,
    HomeViewComponent,
    HeaderComponent,
    UserSettingsViewComponent,
    courseComponents,
    EditViewComponent,
    TranslatePipe,
    EvaluateViewComponent,
    EvaluateTableComponent,
    EditGroupComponent,
    EditPartitionComponent,
    TutorHomeComponent,
    AdminHomeComponent,
    UserFormComponent,
    UserListComponent,
    DegreeProgramFormComponent,
    DegreeProgramListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BreadcrumbModule,
    BadgeModule,
    TableModule,
    AccordionModule,
    DataViewModule,
    TagModule,
    ButtonModule,
    DragDropModule,
    ConfirmDialogModule,
    ToastModule,
    EditorModule,
    InputNumberModule,
    ReactiveFormsModule,
    KnobModule,
    SpeedDialModule,
    ContextMenuModule,
    DialogModule,
    DropdownModule,
    MultiSelectModule,
    BlockUIModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    ConfirmationService,
    MessageService,
    TranslationService
  ]
})
export class AppModule {
}
