import {Injectable} from '@angular/core';
import {NewUser, User} from "../models/user.models";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, distinctUntilChanged, map, Observable, of, switchMap, tap} from "rxjs";
import {xSimpleCourseInstance} from "../../features/course/models/course.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());
  public isAuthenticated = this.currentUser.pipe(
    tap(user => {
      if (!user) {
        this.getUser().subscribe();
      }
    }),
    switchMap(user => user ? of(!!user) : this.getUser().pipe(map(fetchedUser => !!fetchedUser))),
  );

  constructor(private http: HttpClient) {
  }

  setUser(user: User | null) {
    this.currentUserSubject.next(user);
  }

  getUser(): Observable<User> {
    if (this.currentUserSubject.value) {
      return of(this.currentUserSubject.value);
    } else {
      return this.http.get<User>('user/').pipe(
        tap(user => {
          this.currentUserSubject.next(user);
        })
      );
    }
  }

  getUserCourses() {
    return this.http.get<xSimpleCourseInstance[]>('courses/')
  }

  registerUser(user: NewUser) {
    return this.http.post('create-user/', user);
  }
}
