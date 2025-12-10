import { Component, OnInit } from '@angular/core';
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
import { UrlParamService } from '../../../../shared/services/url-param.service';

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
export class StaffListComponent implements OnInit {
  degreeProgramAbbreviation: string = '';
  userRoles: string[] = [];

  users: DetailUser[] = [];

  constructor(
    private userService: UserService,
    private degreeProgramService: DegreeProgramService,
    private route: ActivatedRoute,
    private urlParamService: UrlParamService,
  ) {}

  ngOnInit() {
    this.degreeProgramAbbreviation = this.urlParamService.findParam(
      'abbreviation',
      this.route,
    );

    this.userService.getUserRoles().subscribe({
      next: (value) => {
        this.userRoles = value;
      },
    });

    this.userService
      .getUsers([`dp=${this.degreeProgramAbbreviation}`])
      .subscribe({
        next: (value) => {
          this.users = value;
        },
      });
  }

  onActiveChange(user: DetailUser, event: { checked?: boolean }) {
    this.userService
      .patchUser(user.username, { isActive: event.checked })
      .subscribe({
        next: (value) => (user = value),
      });
  }

  onRemoveClick(username: string) {
    this.degreeProgramService
      .removeUserDegreeProgramConnection(
        username,
        this.degreeProgramAbbreviation,
      )
      .subscribe({
        next: () => {
          this.users = this.users.filter((user) => user.username !== username);
        },
      });
  }
}
