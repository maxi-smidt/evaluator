import { Component } from '@angular/core';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { TranslationService } from '../../../../shared/services/translation.service';
import { MultiStudentFormComponent } from './multi-student-form/multi-student-form.component';
import { SingleStudentFormComponent } from './single-student-form/single-student-form.component';

@Component({
  selector: 'ms-student-form',
  standalone: true,
  imports: [
    TabMenuModule,
    MultiStudentFormComponent,
    SingleStudentFormComponent,
  ],
  templateUrl: './student-form.component.html',
})
export class StudentFormComponent {
  items: MenuItem[] | undefined;
  activeItem: MenuItem | undefined;

  constructor(private translationService: TranslationService) {
    this.items = [
      {
        label: this.translationService.translate(
          'degree-program.students-view.multi',
        ),
        icon: 'pi pi-users',
      },
      {
        label: this.translationService.translate(
          'degree-program.students-view.single',
        ),
        icon: 'pi pi-user',
      },
    ];
    this.activeItem = this.items[0];
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }
}
