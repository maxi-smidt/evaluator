import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private translations: unknown;

  constructor(private http: HttpClient) {}

  loadLanguage(language: string): Observable<unknown> {
    return this.http.get(`assets/i18n/${language}.json`).pipe(
      tap((translations) => {
        this.translations = translations;
      }),
    );
  }

  translate(key: string): string {
    const keys = key.split('.');
    let result: unknown = this.translations;

    for (const k of keys) {
      if (typeof result === 'object' && result !== null && k in result) {
        result = (result as Record<string, unknown>)[k];
      }
    }

    return typeof result === 'string' ? result : key;
  }

  getArray(key: string): string[] {
    const keys = key.split('.');
    let result: unknown = this.translations;

    for (const k of keys) {
      if (typeof result === 'object' && result !== null && k in result) {
        result = (result as Record<string, unknown>)[k];
      }
    }

    return Array.isArray(result) ? (result as string[]) : [key];
  }
}
