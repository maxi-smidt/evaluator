import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  template: `
    <div class="container-fluid mt-2">
      <router-outlet></router-outlet>
    </div>`,
  standalone: true,
  imports: [
    RouterOutlet
  ]
})
export class CourseComponent {
}
