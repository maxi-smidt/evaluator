import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(private http: HttpClient) {}

  submitReport(title: string, description: string, type: string) {
    const data = {
      title: title,
      description: description,
      type: type,
    };
    return this.http.post('report/', data);
  }
}
