import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, firstValueFrom, map, of} from "rxjs";
import {BaseApiService} from "./base-api.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseApiService {
  private currentUserSubject: BehaviorSubject<any> =
    new BehaviorSubject<any>(localStorage.getItem('currentUser')
      ? JSON.parse(localStorage.getItem('currentUser')!)
      : null);

  private isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private isSuperUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  login(s_number: string, password: string) {
    console.log("login (Auth a)")
    return this.http.post<any>(this.baseUrl + 'token/', {s_number, password})
      .pipe(map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }));
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isUserLoggedIn.next(false);
    this.isSuperUserLoggedIn.next(false);
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
        catchError(error => {
          this.router.navigate(['login']).then();
          return of(false);
        })
      )
    );
  }

  canActivateSuperUser(): Promise<boolean> {
    return firstValueFrom(
      this.http.get<{ canActivateSuperUser: boolean }>(this.baseUrl + 'can-activate-superuser/').pipe(
        map(response => {
          if (!response.canActivateSuperUser) {
            this.router.navigate(['home']).then();
          }
          this.isSuperUserLoggedIn.next(true);
          return response.canActivateSuperUser;
        }),
        catchError(error => {
          this.router.navigate(['home']).then();
          return of(false);
        })
      )
    );
  }

  get isLoggedIn(): boolean {
    return this.isUserLoggedIn.value;
  }

  get isSuperLoggedIn(): boolean {
    return this.isSuperUserLoggedIn.value;
  }
}
