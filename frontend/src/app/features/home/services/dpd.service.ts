import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DegreeProgram } from '../../degree-program/models/degree-program.model';

@Injectable({
  providedIn: 'root',
})
export class DpdService {
  private http = inject(HttpClient);

  getDegreePrograms() {
    return this.http.get<DegreeProgram[]>('degree-programs/');
  }
}
