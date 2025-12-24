import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ToastModule } from 'primeng/toast';
import { TranslationService } from './shared/services/translation.service';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { ApiInterceptor } from './core/interceptors/api.interceptor';
import { provideRouter, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';

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

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      }),
    ),
    importProvidersFrom(BrowserModule, ToastModule),
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
};
