import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  baseUrl: string;

  constructor(protected http: HttpClient, protected router: Router) {
    this.baseUrl = environment.apiUrl;
  }
}
