import {
  provideAppInitializer,
  inject,
  importProvidersFrom,
} from '@angular/core';

import { TranslationService } from './app/shared/services/translation.service';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { JwtInterceptor } from './app/core/interceptors/jwt.interceptor';
import { ApiInterceptor } from './app/core/interceptors/api.interceptor';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { ToastModule } from 'primeng/toast';
import { AppComponent } from './app/app.component';
import Aura from '@primeng/themes/aura';

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

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule, ToastModule),
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
}).catch((err) => console.error(err));
