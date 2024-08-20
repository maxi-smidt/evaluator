import {Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'ms-assignment',
  template: `<router-outlet></router-outlet>`,
  standalone: true,
  imports: [
    RouterOutlet
  ]
})
export class AssignmentComponent {
}
