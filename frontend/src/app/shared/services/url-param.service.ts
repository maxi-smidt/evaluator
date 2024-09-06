import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UrlParamService {
  findParam<T = string>(paramName: string, route: ActivatedRoute): T {
    let param: string | null = null;
    let r: ActivatedRoute | null = route;

    while (r !== undefined) {
      if (r!.snapshot.params[paramName] !== undefined) {
        param = r!.snapshot.params[paramName];
        break;
      }
      r = r!.parent;
    }

    if (!param) {
      throw new Error('Url parameter not found');
    }

    return param as T;
  }
}
