import { Injectable } from '@angular/core';
import {BaseApiService} from "./base-api.service";
import {User} from "../interfaces/user";
import {BaseCourse} from "../interfaces/base-course";

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseApiService {


  getUser() {
    return this.http.get<User>(this.baseUrl + 'get-user');
  }

  getUserCourses() {
    return this.http.get<BaseCourse[]>(this.baseUrl + 'get-courses')
  }

}
