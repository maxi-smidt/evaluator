import {Injectable} from '@angular/core';
import {NewUser, RegisteredUser} from "../interfaces/user";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) {
  }

  getAllUsers() {
    return this.http.get<RegisteredUser[]>('all-users/');
  }

  registerUser(user: NewUser) {
    const body = {
      user: user
    }
    return this.http.post('register-user/', body);
  }

  registerDegreeProgram(degreeProgram: {name: string, abbreviation: string, id: string}) {
    const body = {
      degree_program: degreeProgram
    }
    return this.http.post('register-degree-program/', body);
  }

  changeUserActivityState(users: RegisteredUser[]) {
    const body = {
      users: users
    }
    return this.http.post('change-user-activity-state/', body);
  }

  getDegreeProgramDirectors() {
    return this.http.get<{name: string, id: string}[]>('get-degree-program-directors/');
  }

  getDegreePrograms() {
    return this.http.get<{name: string, abbreviation: string, dpd: string}[]>('get-degree-programs/');
  }
}
