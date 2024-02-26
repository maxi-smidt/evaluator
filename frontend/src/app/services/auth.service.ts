import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, firstValueFrom, map, of} from "rxjs";
import {BaseApiService} from "./base-api.service";
import {User} from "../interfaces/user";

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseApiService {
  private currentUserSubject: BehaviorSubject<any> = new BehaviorSubject<any>(this.token);
  private isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  login(username: string, password: string) {
    return this.http.post<any>(this.baseUrl + 'token/', {username, password})
      .pipe(map(token => {
        this.token = token;
        this.currentUserSubject.next(token);
      }));
  }

  refreshToken() {
    return this.http.post<any>(this.baseUrl + 'token/refresh/', {'refresh': this.refToken})
      .pipe(map(token => {
        this.token = token;
        this.currentUserSubject.next(token);
      }));
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isUserLoggedIn.next(false);
    this.router.navigate(['login']).then();
  }

  canActivate(): Promise<boolean> {
    return firstValueFrom(
      this.http.get<{ canActivateUser: boolean }>(this.baseUrl + 'can-activate/').pipe(
        map(response => {
          if (!response.canActivateUser) {
            this.isUserLoggedIn.next(false);
            this.router.navigate(['login']).then();
          }
          this.isUserLoggedIn.next(true);
          return true;
        }),
        catchError(() => {
          this.router.navigate(['login']).then();
          return of(false);
        })
      )
    );
  }

  isLoggedIn(): boolean {
    return this.isUserLoggedIn.value;
  }

  get token() {
    return localStorage.getItem('currentUser')
      ? JSON.parse(localStorage.getItem('currentUser')!)
      : null
  }

  get accessToken() {
    return this.getToken('access');
  }

  get refToken() {
    return this.getToken('refresh');
  }

  private getToken(type: string) {
    return localStorage.getItem('currentUser')
      ? JSON.parse(localStorage.getItem('currentUser')!)[type]
      : null
  }

  set token(token: any) {
    localStorage.setItem('currentUser', JSON.stringify(token));
  }
}
