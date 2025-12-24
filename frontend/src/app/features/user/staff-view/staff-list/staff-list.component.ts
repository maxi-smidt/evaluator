import { Component, inject } from '@angular/core';
import { DetailUser } from '../../../../core/models/user.models';
import { UserService } from '../../../../core/services/user.service';
import { Button } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DegreeProgramService } from '../../../degree-program/services/degree-program.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-staff-list',
  imports: [
    Button,
    SelectModule,
    PrimeTemplate,
    TableModule,
    TranslatePipe,
    FormsModule,
    CheckboxModule,
  ],
  templateUrl: './staff-list.component.html',
})
export class StaffListComponent {
  private readonly userService = inject(UserService);
  private readonly degreeProgramService = inject(DegreeProgramService);
  private readonly route = inject(ActivatedRoute);

  private readonly refresh$ = new BehaviorSubject<void>(undefined);
  private readonly degreeProgramAbbreviation$ = this.route.params.pipe(
    map((params) => params['abbreviation']),
  );
  private readonly degreeProgramAbbreviation = toSignal(
    this.degreeProgramAbbreviation$,
  );
  protected readonly userRoles = toSignal(this.userService.getUserRoles());
  protected readonly users = toSignal(
    combineLatest([this.degreeProgramAbbreviation$, this.refresh$]).pipe(
      switchMap(([abbreviation, _]) =>
        this.userService.getUsers([`dp=${abbreviation}`]),
      ),
    ),
    { initialValue: [] },
  );

  protected onActiveChange(user: DetailUser, event: { checked?: boolean }) {
    this.userService
      .patchUser(user.username, { isActive: event.checked })
      .subscribe({
        next: (value) => (user = value),
      });
  }

  protected onRemoveClick(username: string) {
    this.degreeProgramService
      .removeUserDegreeProgramConnection(
        username,
        this.degreeProgramAbbreviation(),
      )
      .subscribe({
        next: () => {
          this.refresh$.next();
        },
      });
  }
}
