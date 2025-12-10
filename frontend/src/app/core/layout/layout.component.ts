import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer/footer.component';

@Component({
    selector: 'ms-layout',
    templateUrl: './layout.component.html',
    imports: [HeaderComponent, RouterOutlet, FooterComponent]
})
export class LayoutComponent {
  constructor() {}
}
