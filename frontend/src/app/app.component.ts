import { Component } from '@angular/core';

@Component({
  selector: 'ms-root',
  template: `
    <router-outlet />
    <p-toast />
  `,
})
export class AppComponent {
  title = 'frontend';
  constructor() {}
}
