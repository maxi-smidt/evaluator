import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './components/login/login.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {HomeViewComponent} from './components/views/home-view/home-view.component';
import {JwtInterceptor} from "./interceptors/jwt.interceptor";
import {AdminViewComponent} from './components/views/admin-view/admin-view.component';
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
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {EditViewComponent} from './components/views/course/edit-view/edit-view.component';
import {DragDropModule} from "primeng/dragdrop";
import {ConfirmationService, MessageService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToastModule} from "primeng/toast";
import {TranslatePipe} from './pipes/translate.pipe';
import {TranslationService} from "./services/translation.service";
import {EvaluateViewComponent} from './components/views/course/evaluate-view/evaluate-view.component';
import {EvaluateTableComponent} from "./components/views/course/evaluate-view/evaluate-table/evaluate-table.component";
import {MatTableModule} from "@angular/material/table";
import {EditorModule} from 'primeng/editor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeViewComponent,
    AdminViewComponent,
    HeaderComponent,
    UserSettingsViewComponent,
    courseComponents,
    EditViewComponent,
    TranslatePipe,
    EvaluateViewComponent,
    EvaluateTableComponent
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
    MatIconModule,
    MatButtonModule,
    DragDropModule,
    ConfirmDialogModule,
    ToastModule,
    MatTableModule,
    EditorModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    ConfirmationService,
    MessageService,
    TranslationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
