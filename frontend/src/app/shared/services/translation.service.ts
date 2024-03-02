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

  loadLanguage(language: string): Observable<any> {
    return this.http.get(`assets/i18n/${language}.json`).pipe(
      tap((translations: any) => {
        this.translations = translations;
      })
    );
  }

  translate(key: string): string {
    const keys = key.split('.');
    let result = this.translations;

    for (let k of keys) {
      result = result[k];

      if (result === undefined) {
        return key;
      }
    }
    return result;
  }

  getArray(key: string): string[] {
    const keys = key.split('.');
    let result = this.translations;

    for (let k of keys) {
      result = result[k];

      if (result === undefined) {
        return [key];
      }
    }
    return result;
  }
}
