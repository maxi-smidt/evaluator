import { CanActivateFn } from '@angular/router';

export const tutorAuthGuard: CanActivateFn = (route, state) => {
  return true;
};
