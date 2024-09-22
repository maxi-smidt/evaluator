import { Component, OnInit } from '@angular/core';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { TranslationService } from '../../../../shared/services/translation.service';
import { MultiStudentFormComponent } from './multi-student-form/multi-student-form.component';
import { SingleStudentFormComponent } from './single-student-form/single-student-form.component';
import { UrlParamService } from '../../../../shared/services/url-param.service';
import { ActivatedRoute } from '@angular/router';
import { DegreeProgramService } from '../../services/degree-program.service';
import { ClassGroup } from '../../models/class-group.model';

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
export class StudentFormComponent implements OnInit {
  items: MenuItem[] | undefined;
  activeItem: MenuItem | undefined;
  classGroups: ClassGroup[] = [];

  constructor(
    private translationService: TranslationService,
    private degreeProgramService: DegreeProgramService,
    private route: ActivatedRoute,
    private urlParamService: UrlParamService,
  ) {
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

  ngOnInit(): void {
    const degreeProgramAbbreviation = this.urlParamService.findParam(
      'abbreviation',
      this.route,
    );
    this.degreeProgramService
      .getClassGroups(degreeProgramAbbreviation)
      .subscribe({
        next: (value) => {
          this.classGroups = value;
        },
      });
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }
}
