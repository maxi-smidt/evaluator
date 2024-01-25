import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const currentUser =
      localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null;

    if (currentUser && currentUser.access) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.access}`
        }
      });
    }
    return next.handle(request);
  }
}
