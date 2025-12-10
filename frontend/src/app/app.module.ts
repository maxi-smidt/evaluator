import { NgModule, inject, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { HeaderComponent } from './core/layout/header/header.component';
import { SettingsViewComponent } from './features/user/settings-view/settings-view.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslationService } from './shared/services/translation.service';
import { ApiInterceptor } from './core/interceptors/api.interceptor';
import { TranslatePipe } from './shared/pipes/translate.pipe';
import { HomeComponent } from './features/home/home.component';
import { ToastModule } from 'primeng/toast';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';

const AuraBlue = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
  },
});

function loadTranslations(translationService: TranslationService) {
  return () =>
    new Promise<void>((resolve, reject) => {
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
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    TranslatePipe,
    HeaderComponent,
    HomeComponent,
    SettingsViewComponent,
    ToastModule,
  ],
  providers: [
    provideAppInitializer(() => {
      const initializerFn = loadTranslations(inject(TranslationService));
      return initializerFn();
    }),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
    ConfirmationService,
    MessageService,
    TranslationService,
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: AuraBlue,
        options: {
          cssLayer: {
            name: 'primeng',
            order: 'bootstrap-reboot, primeng, quill',
          },
        },
      },
    }),
  ],
})
export class AppModule {}
