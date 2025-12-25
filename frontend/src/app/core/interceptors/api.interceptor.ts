import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const url = this.getUrl(req.url);
    const apiReq = req.clone({ url: url });
    return next.handle(apiReq);
  }

  getUrl(url: string): string {
    if (url.includes('i18n/')) return url;

    if (url.includes('spring/')) {
      const newUrl = url.replace('spring/', '');
      return `${environment.springApiUrl}/${newUrl}`;
    }

    return `${environment.djangoApiUrl}/${url}`;
  }
}
