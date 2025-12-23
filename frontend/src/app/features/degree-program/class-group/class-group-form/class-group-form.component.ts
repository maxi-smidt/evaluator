import { Component, inject } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { DegreeProgramService } from '../../services/degree-program.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';
import { Button } from 'primeng/button';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-class-group-form',
  imports: [TranslatePipe, DatePickerModule, FormsModule, Button],
  templateUrl: './class-group-form.component.html',
})
export class ClassGroupFormComponent {
  private readonly degreeProgramService = inject(DegreeProgramService);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  private readonly degreeProgramAbbreviation = toSignal(
    this.route.params.pipe(map((params) => params['abbreviation'])),
  );

  protected readonly minDate: Date = new Date();
  protected readonly maxDate: Date = new Date();
  protected date: Date = new Date();

  constructor() {
    this.minDate.setFullYear(this.getYear() - 5);
    this.maxDate.setFullYear(this.getYear() + 5);
  }

  private getYear() {
    return this.date.getFullYear();
  }

  protected onSubmit() {
    this.degreeProgramService
      .createClassGroup(this.degreeProgramAbbreviation()!, this.getYear())
      .subscribe({
        next: (value) => {
          this.toastService.success('common.saved');
          void this.router.navigate([value.id], {
            relativeTo: this.route.parent,
          });
        },
        error: (err) => {
          if (err.status === 500) {
            this.toastService.error(
              'degree-program.class-groups-view.error-500',
            );
          }
        },
      });
  }
}
