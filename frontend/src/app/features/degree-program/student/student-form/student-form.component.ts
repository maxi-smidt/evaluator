import { Component, OnInit } from '@angular/core';
import { MultiStudentFormComponent } from './multi-student-form/multi-student-form.component';
import { SingleStudentFormComponent } from './single-student-form/single-student-form.component';
import { UrlParamService } from '../../../../shared/services/url-param.service';
import { ActivatedRoute } from '@angular/router';
import { DegreeProgramService } from '../../services/degree-program.service';
import { ClassGroup } from '../../models/class-group.model';
import { TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'ms-student-form',
  imports: [
    MultiStudentFormComponent,
    SingleStudentFormComponent,
    TabList,
    TabPanels,
    TabPanel,
    Tabs,
    TranslatePipe,
  ],
  templateUrl: './student-form.component.html',
})
export class StudentFormComponent implements OnInit {
  classGroups: ClassGroup[] = [];

  constructor(
    private degreeProgramService: DegreeProgramService,
    private route: ActivatedRoute,
    private urlParamService: UrlParamService,
  ) {}

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
}
