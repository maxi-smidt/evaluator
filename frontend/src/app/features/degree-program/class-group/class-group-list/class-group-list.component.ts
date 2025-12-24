import { Component, inject } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Button } from 'primeng/button';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DegreeProgramService } from '../../services/degree-program.service';
import { map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-class-group-list',
  imports: [TranslatePipe, Button, PrimeTemplate, TableModule],
  templateUrl: './class-group-list.component.html',
})
export class ClassGroupListComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly degreeProgramService = inject(DegreeProgramService);

  private readonly degreeProgramAbbreviation$ = this.route.params.pipe(
    map((params) => params['abbreviation']),
  );
  protected readonly classes = toSignal(
    this.degreeProgramAbbreviation$.pipe(
      switchMap((abbreviation) =>
        this.degreeProgramService.getClassGroups(abbreviation),
      ),
    ),
    { initialValue: [] },
  );

  protected routeToClass(id: number) {
    void this.router.navigate([id], { relativeTo: this.route.parent });
  }
}
