import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'ms-root',
  template: `
    <router-outlet />
    <p-toast [life]="5000" />
  `,
  imports: [RouterOutlet, Toast],
})
export class App {}
