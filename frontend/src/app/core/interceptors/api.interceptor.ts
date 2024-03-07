import {Injectable} from "@angular/core";
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";

@Injectable({providedIn: "root"})
export class ApiInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const url = req.url.includes('assets/') ? req.url : `${environment.apiUrl}/${req.url}`;
    const apiReq = req.clone({url: url});
    return next.handle(apiReq);
  }
}
