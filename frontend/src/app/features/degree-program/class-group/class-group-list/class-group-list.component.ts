import { Component, OnInit } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Button } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ClassGroup } from '../../models/class-group.model';
import { DegreeProgramService } from '../../services/degree-program.service';
import { UrlParamService } from '../../../../shared/services/url-param.service';

@Component({
  selector: 'ms-class-group-list',
  standalone: true,
  imports: [TranslatePipe, Button, DropdownModule, PrimeTemplate, TableModule],
  templateUrl: './class-group-list.component.html',
})
export class ClassGroupListComponent implements OnInit {
  classes: ClassGroup[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private urlParamService: UrlParamService,
    private degreeProgramService: DegreeProgramService,
  ) {}

  ngOnInit() {
    const degreeProgramAbbreviation = this.urlParamService.findParam(
      'abbreviation',
      this.route,
    );
    this.degreeProgramService
      .getClassGroups(degreeProgramAbbreviation)
      .subscribe({
        next: (value) => {
          this.classes = value;
        },
      });
  }

  routeToClass(id: number) {
    this.router.navigate([id], { relativeTo: this.route.parent }).then();
  }
}
