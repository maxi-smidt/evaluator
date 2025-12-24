import { Component, inject } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { DegreeProgramService } from '../../services/degree-program.service';
import { ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { StudentService } from '../../services/student.service';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-class-group-detail',
  imports: [
    TranslatePipe,
    Button,
    PrimeTemplate,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  templateUrl: './class-group-detail.component.html',
})
export class ClassGroupDetailComponent {
  private readonly degreeProgramService = inject(DegreeProgramService);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly studentService = inject(StudentService);

  private readonly refresh$ = new BehaviorSubject<void>(undefined);
  private readonly classGroupId$ = this.route.params.pipe(
    map((params) => params['classGroupId']),
  );
  private readonly degreeProgramAbbreviation$ = this.route.params.pipe(
    map((params) => params['abbreviation']),
  );
  protected readonly classGroup = toSignal(
    combineLatest([this.classGroupId$, this.refresh$]).pipe(
      switchMap(([id, _]) => this.degreeProgramService.getClassGroup(id)),
    ),
  );
  protected readonly classGroups = toSignal(
    combineLatest([
      this.degreeProgramAbbreviation$,
      this.classGroupId$,
      this.refresh$,
    ]).pipe(
      switchMap(([abbreviation, classGroupId, _]) =>
        this.degreeProgramService
          .getClassGroups(abbreviation)
          .pipe(
            map((groups) =>
              groups.filter((group) => group.id !== classGroupId),
            ),
          ),
      ),
    ),
    { initialValue: [] },
  );
  protected modalVisibility: boolean = false;
  protected selectedStudentId: string | undefined;

  protected removeStudentFromClass(studentId: string) {
    this.confirmationService
      .makeConfirmDialog(
        'common.confirmation.header',
        'degree-program.class-groups-view.confirmation-message',
        'common.confirmation.accept',
        'common.confirmation.reject',
      )
      .then((save) => {
        if (save) {
          this.studentService.removeFromClassGroup(studentId).subscribe({
            next: () => this.refresh$.next(),
          });
        }
      });
  }

  protected setSelectedStudent(studentId: string) {
    this.selectedStudentId = studentId;
    this.modalVisibility = true;
  }

  protected setSelectedClassGroup(classGroupId: number) {
    this.modalVisibility = false;
    this.changeStudentsClassGroup(this.selectedStudentId!, classGroupId);
    this.selectedStudentId = undefined;
  }

  protected changeStudentsClassGroup(studentId: string, classGroupId: number) {
    this.studentService.changeClassGroup(studentId, classGroupId).subscribe({
      next: () => this.refresh$.next(),
    });
  }
}
