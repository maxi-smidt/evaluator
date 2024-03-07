import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: any = {};

  constructor(private http: HttpClient) {
  }

  loadLanguage(language: string): Observable<unknown> {
    return this.http.get(`assets/i18n/${language}.json`).pipe(
      tap((translations) => {
        this.translations = translations;
      })
    );
  }

  translate(key: string): string {
    const keys = key.split('.');
    let result = this.translations;

    for (const k of keys) {
      result = result[k];

      if (result === undefined) {
        return key;
      }
    }
    return result as string;
  }

  getArray(key: string): string[] {
    const keys = key.split('.');
    let result = this.translations;

    for (const k of keys) {
      result = result[k];

      if (result === undefined) {
        return [key];
      }
    }
    return result;
  }
}
