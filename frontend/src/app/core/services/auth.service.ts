import {Injectable} from '@angular/core';
import {map} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {JwtService} from "./jwt.service";
import {User} from "../../interfaces/user";
import {UserService} from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient,
              private router: Router,
              private jwtService: JwtService,
              private userService: UserService) {
  }

  login(username: string, password: string) {
    return this.http.post<{token: string, user: User}>('login/', {username, password})
      .pipe(map(value => {
        console.log(value);
        this.setAuth(value.user, value.token);
      }));
  }

  setAuth(user: User, token: string): void {
    this.jwtService.saveToken(token);
    this.userService.setUser(user);
  }

  refreshToken() {
    return this.http.post<{token: string, user: User}>('token/refresh/', {'refresh': this.jwtService.getRefreshToken()})
      .pipe(map(value => {
        this.setAuth(value.user, value.token);
      }));
  }

  logout() {
    this.purgeAuth();
    this.router.navigate(['login']).then();
  }

  purgeAuth(): void {
    this.jwtService.destroyToken();
    this.userService.setUser(null);
  }
}
