import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  getAccessToken(): string | null {
    return this.getToken('access');
  }

  getRefreshToken(): string | null {
    return this.getToken('refresh');
  }

  getToken(type: string | null = null) {
    const token = window.localStorage["jwtToken"]
    if (type) {
      return token ? JSON.parse(token)[type] : null;
    }
    return token ? JSON.parse(token) : null;
  }

  saveToken(token: string): void {
    window.localStorage["jwtToken"] = JSON.stringify(token);
  }

  destroyToken(): void {
    window.localStorage.removeItem("jwtToken");
  }
}
