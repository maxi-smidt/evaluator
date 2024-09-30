import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PreviousDeductions } from '../models/previous-deduction.model';

@Injectable({
  providedIn: 'root',
})
export class PreviousDeductionsService {
  constructor(private http: HttpClient) {}

  getPreviousDeductions(correctionId: number, idType: string) {
    return this.http.get<PreviousDeductions>(
      `deductions/${correctionId}/?id_type=${idType}`,
    );
  }

  createPreviousDeductions(draft: string, assignmentId: number) {
    return this.http.post('deductions/create/', {
      draft: JSON.parse(draft),
      assignment: assignmentId,
    });
  }

  putPreviousDeductions(assignmentId: number, draft: string, idType: string) {
    return this.http.put(`deductions/${assignmentId}/?id_type=${idType}`, {
      draft: JSON.parse(draft),
    });
  }
}
