import { Component, inject } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { StudentService } from '../../services/student.service';
import { ActivatedRoute } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-student-list',
  imports: [
    TranslatePipe,
    CheckboxModule,
    PrimeTemplate,
    TableModule,
    SelectModule,
  ],
  templateUrl: './student-list.component.html',
})
export class StudentListComponent {
  private readonly studentService = inject(StudentService);
  private readonly route = inject(ActivatedRoute);

  private degreeProgramAbbreviation$ = this.route.params.pipe(
    map((params) => params['abbreviation']),
  );
  protected students = toSignal(
    this.degreeProgramAbbreviation$.pipe(
      switchMap((abbreviation) =>
        this.studentService.getStudents('abbreviation', abbreviation),
      ),
    ),
    { initialValue: [] },
  );
}
