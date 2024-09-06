import { Injectable } from '@angular/core';
import { DetailUser, PasswordUser, User } from '../models/user.models';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject
    .asObservable()
    .pipe(distinctUntilChanged());
  public isAuthenticated = this.currentUser.pipe(
    tap((user) => {
      if (!user) {
        this.getUser().subscribe();
      }
    }),
    switchMap((user) =>
      user
        ? of(!!user)
        : this.getUser().pipe(map((fetchedUser) => !!fetchedUser)),
    ),
  );

  constructor(private http: HttpClient) {}

  setUser(user: User | null) {
    this.currentUserSubject.next(user);
  }

  getUser(): Observable<User> {
    if (this.currentUserSubject.value) {
      return of(this.currentUserSubject.value);
    } else {
      return this.http.get<User>('user/').pipe(
        tap((user) => {
          this.currentUserSubject.next(user);
        }),
      );
    }
  }

  registerUser(user: PasswordUser) {
    return this.http.post('create-user/', user);
  }

  /**
   * Fetches a list of users based on provided args
   * @param args Allowed arguments: <ul>
   *              <li>dp=string -> all staff related to the program abbreviation (requirement: none)</li>
   *              <li>exclude=boolean -> all users except staff of the program (requirement: dp)</li>
   *              <li>course=number -> all users related to provided course instance (requirement: none)</li>
   *              <li>get-dp=boolean -> all users related to a program which contains this course (requirement: course)</li>
   *            </ul>
   */
  getUsers(args: string[] = []) {
    const extension = '?' + args.join('&');
    return this.http.get<DetailUser[]>(`users/${extension}`);
  }

  patchUser(username: string, patch: object) {
    return this.http.patch<DetailUser>(`user/?username=${username}`, patch);
  }

  getUserRoles() {
    return this.http.get<string[]>('user-roles/');
  }
}
