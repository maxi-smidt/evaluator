import {CanActivateFn} from "@angular/router";
import {inject} from "@angular/core";
import {UserService} from "../services/user.service";
import {Observable} from "rxjs";

export const userAuthGuard: CanActivateFn = (): Observable<boolean> => {
  return inject(UserService).isAuthenticated;
}
