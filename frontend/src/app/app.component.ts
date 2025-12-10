import { Component } from '@angular/core';

@Component({
  selector: 'ms-root',
  template: `
    <router-outlet />
    <p-toast [life]="5000" />
  `,
  standalone: false,
})
export class AppComponent {
  title = 'frontend';
  constructor() {}
}
