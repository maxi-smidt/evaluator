import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DegreeProgram} from "../models/degree-program.model";

@Injectable({
  providedIn: 'root'
})
export class DegreeProgramService {

  constructor(private http: HttpClient) {
  }

  getDegreeProgram(abbreviation: string) {
    return this.http.get<DegreeProgram>(`degree-program/${abbreviation}/`);
  }

  createUserDegreeProgramConnection(username: string, abbreviation: string) {
    return this.http.post('user-degree-program/create/', {username: username, abbreviation: abbreviation});
  }

  removeUserDegreeProgramConnection(username: string, abbreviation: string) {
    return this.http.delete(`user-degree-program/${username}&${abbreviation}/`);
  }
}
