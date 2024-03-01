import {Injectable} from '@angular/core';
import {User} from "../../interfaces/user";
import {BaseCourse} from "../../interfaces/base-course";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, distinctUntilChanged, map} from "rxjs";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());
  public isAuthenticated = this.currentUser.pipe(map((user) => !!user));

  constructor(private http: HttpClient) {
  }

  setUser(user: User | null) {
    this.currentUserSubject.next(user);
  }

  getUser() {
    return this.currentUser;
  }

  getUserCourses() {
    return this.http.get<BaseCourse[]>('get-courses/')
  }


}
