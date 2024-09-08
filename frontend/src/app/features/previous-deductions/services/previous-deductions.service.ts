import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PreviousDeductions } from '../models/previous-deduction.model';

@Injectable({
  providedIn: 'root',
})
export class PreviousDeductionsService {
  constructor(private http: HttpClient) {}

  getPreviousDeductions(correctionId: number) {
    return this.http.get<{ draft: PreviousDeductions }>(
      `deductions/${correctionId}/`,
    );
  }
}
