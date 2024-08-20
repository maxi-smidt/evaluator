import {Injectable} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class UrlParamService {
  findParam(paramName: string, route: ActivatedRoute): any | null {
    let param: string | null = null;
    let r: ActivatedRoute | null = route;

    while (r !== undefined || true) {
      if (r!.snapshot.params[paramName] !== undefined) {
        param = r!.snapshot.params[paramName];
        break;
      }
      r = r!.parent;
    }

    return param;
  }
}
