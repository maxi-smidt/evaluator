import {Injectable} from '@angular/core';
import {NewUser, RegisteredUser} from "../interfaces/user";
import {BaseApiService} from "./base-api.service";

@Injectable({
  providedIn: 'root'
})
export class AdminService extends BaseApiService {

  getAllUsers() {
    return this.http.get<RegisteredUser[]>(this.baseUrl + 'all-users/');
  }

  registerUser(user: NewUser) {
    const body = {
      user: user
    }
    return this.http.post(this.baseUrl + 'register-user/', body);
  }

  registerDegreeProgram(degreeProgram: {name: string, abbreviation: string, id: string}) {
    const body = {
      degree_program: degreeProgram
    }
    return this.http.post(this.baseUrl + 'register-degree-program/', body);
  }

  changeUserActivityState(users: RegisteredUser[]) {
    const body = {
      users: users
    }
    return this.http.post(this.baseUrl + 'change-user-activity-state/', body);
  }

  getDegreeProgramDirectors() {
    return this.http.get<{name: string, id: string}[]>(this.baseUrl + 'get-degree-program-directors/');
  }

  getDegreePrograms() {
    return this.http.get<{name: string, abbreviation: string, dpd: string}[]>(this.baseUrl + 'get-degree-programs/');
  }
}
