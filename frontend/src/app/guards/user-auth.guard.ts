import {CanActivateFn} from "@angular/router";
import {inject} from "@angular/core";
import {AuthService} from "../services/auth.service";

export const userAuthGuard: CanActivateFn = (): Promise<boolean> => {
  return inject(AuthService).canActivate();
}
