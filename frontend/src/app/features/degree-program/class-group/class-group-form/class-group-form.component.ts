import { Component, OnInit } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { DegreeProgramService } from '../../services/degree-program.service';
import { UrlParamService } from '../../../../shared/services/url-param.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'ms-class-group-form',
  standalone: true,
  imports: [TranslatePipe, CalendarModule, FormsModule],
  templateUrl: './class-group-form.component.html',
})
export class ClassGroupFormComponent implements OnInit {
  minDate: Date | undefined;
  maxDate: Date | undefined;
  date: Date;
  degreeProgramAbbreviation: string = '';

  constructor(
    private degreeProgramService: DegreeProgramService,
    private urlParamService: UrlParamService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private router: Router,
  ) {
    this.date = new Date();
    this.minDate = new Date();
    this.minDate.setFullYear(this.getYear() - 5);
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.getYear() + 5);
  }

  ngOnInit() {
    this.degreeProgramAbbreviation = this.urlParamService.findParam(
      'abbreviation',
      this.route,
    );
  }

  getYear() {
    return this.date.getFullYear();
  }

  onSubmit() {
    this.degreeProgramService
      .createClassGroup(this.degreeProgramAbbreviation, this.getYear())
      .subscribe({
        next: (value) => {
          this.toastService.success('common.saved');
          this.router
            .navigate([value.id], { relativeTo: this.route.parent })
            .then();
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
