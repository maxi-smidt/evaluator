import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private http = inject(HttpClient);

  changePassword(
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    const data = {
      oldPassword: oldPassword,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
    };
    return this.http.put('change-password/', data);
  }
}
