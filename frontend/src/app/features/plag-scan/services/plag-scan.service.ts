import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PlagScanService {
  constructor(private http: HttpClient) {}

  scanZipFile(file: FormData, language: string) {
    return this.http.post<any>(`jplag/?lang=${language}`, file, {
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }
}
