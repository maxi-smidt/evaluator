import {Injectable} from '@angular/core';
import {DetailUser, SimpleUser} from "../../../core/models/user.models";
import {HttpClient} from "@angular/common/http";
import {AdminDegreeProgram} from "../../degree-program/models/degree-program.model";

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) {
  }

  registerDegreeProgram(degreeProgram: AdminDegreeProgram) {
    return this.http.post('degree-program/create/', degreeProgram);
  }

  changeUserActivityState(users: DetailUser[]) {
    return this.http.post('update-users/', users);
  }

  getDegreeProgramDirectors() {
    return this.http.get<SimpleUser[]>('degree-program-directors/');
  }

  getDegreePrograms() {
    return this.http.get<AdminDegreeProgram[]>('degree-programs/');
  }
}
