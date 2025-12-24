import { Component, inject } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { TableModule } from 'primeng/table';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Button } from 'primeng/button';
import { DegreeProgramService } from '../../../degree-program/services/degree-program.service';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-full-user-list',
  imports: [TableModule, TranslatePipe, Button, SelectModule, FormsModule],
  templateUrl: './full-user-list.component.html',
})
export class FullUserListComponent {
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
        this.userService.getUsers([`dp=${abbreviation}`, 'exclude=true']),
      ),
    ),
    { initialValue: [] },
  );

  protected onAddToDegreeProgramClick(username: string) {
    this.degreeProgramService
      .createUserDegreeProgramConnection(
        username,
        this.degreeProgramAbbreviation(),
      )
      .subscribe({
        next: () => this.refresh$.next(),
      });
  }
}
