import { Component, inject } from '@angular/core';
import { MultiStudentFormComponent } from './multi-student-form/multi-student-form.component';
import { SingleStudentFormComponent } from './single-student-form/single-student-form.component';
import { ActivatedRoute } from '@angular/router';
import { DegreeProgramService } from '../../services/degree-program.service';
import { TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

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
export class StudentFormComponent {
  private readonly degreeProgramService = inject(DegreeProgramService);
  private readonly route = inject(ActivatedRoute);

  private degreeProgramAbbreviation$ = this.route.params.pipe(
    map((params) => params['abbreviation']),
  );
  protected classGroups = toSignal(
    this.degreeProgramAbbreviation$.pipe(
      switchMap((abbreviation) =>
        this.degreeProgramService.getClassGroups(abbreviation),
      ),
    ),
    { initialValue: [] },
  );
}
