import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {JwtInterceptor} from "./core/interceptors/jwt.interceptor";
import {HeaderComponent} from './core/layout/header/header.component';
import {SettingsComponent} from './features/settings/settings.component';
import {ConfirmationService, MessageService} from "primeng/api";
import {TranslationService} from "./shared/services/translation.service";
import {ApiInterceptor} from "./core/interceptors/api.interceptor";
import {TranslatePipe} from "./shared/pipes/translate.pipe";
import {HomeComponent} from "./features/home/home.component";

function loadTranslations(translationService: TranslationService) {
  return () => new Promise<void>((resolve, reject) => {
    translationService.loadLanguage('de').subscribe({
      next: () => {
        resolve();
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    TranslatePipe,
    HeaderComponent,
    HomeComponent,
    SettingsComponent
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: loadTranslations,
      deps: [TranslationService],
      multi: true
    },
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true},
    ConfirmationService,
    MessageService,
    TranslationService
  ]
})
export class AppModule {
}
