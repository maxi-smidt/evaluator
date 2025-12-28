import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PlagScanService {
  private http = inject(HttpClient);

  scanZipFile(file: File, language: string) {
    const formData = new FormData();
    formData.append('zip', file, file.name);

    return this.http.post<Blob>(`spring/jplag/?lang=${language}`, formData, {
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }
}
