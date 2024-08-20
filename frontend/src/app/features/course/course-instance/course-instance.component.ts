import {Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'ms-course-instance',
  template: `
    <router-outlet></router-outlet>`,
  standalone: true,
  imports: [
    RouterOutlet
  ]
})
export class CourseInstanceComponent {
}
