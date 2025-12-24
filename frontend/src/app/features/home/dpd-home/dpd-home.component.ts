import { Component, inject } from '@angular/core';
import { FieldsetModule } from 'primeng/fieldset';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { DpdService } from '../services/dpd.service';
import { DegreeProgram } from '../../degree-program/models/degree-program.model';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-dpd-home',
  imports: [FieldsetModule, TranslatePipe, ButtonModule],
  templateUrl: './dpd-home.component.html',
})
export class DpdHomeComponent {
  private router = inject(Router);
  private degreeProgramService = inject(DpdService);

  protected degreePrograms = toSignal(
    this.degreeProgramService.getDegreePrograms(),
  );

  protected onDegreeProgramClick(dp: DegreeProgram) {
    this.router
      .navigate(['degree-program', dp.abbreviation, 'staff', 'all'])
      .then();
  }
}
