import {Component, OnInit} from '@angular/core';
import {UserService} from "../../../../core/services/user.service";
import {User} from "../../../../core/models/user.models";
import {TableModule} from "primeng/table";
import {TranslatePipe} from "../../../../shared/pipes/translate.pipe";
import {Button} from "primeng/button";
import {DegreeProgramService} from "../../../degree-program/services/degree-program.service";
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {UrlParamService} from "../../../../shared/services/url-param.service";

@Component({
  selector: 'ms-full-user-list',
  standalone: true,
  imports: [
    TableModule,
    TranslatePipe,
    Button,
    DropdownModule,
    FormsModule,
  ],
  templateUrl: './full-user-list.component.html'
})
export class FullUserListComponent implements OnInit {
  degreeProgramAbbreviation: string = '';
  userRoles: string[] = [];

  users: User[] = [];

  constructor(private userService: UserService,
              private degreeProgramService: DegreeProgramService,
              private route: ActivatedRoute,
              private urlParamService: UrlParamService) {
  }

  ngOnInit() {
    this.degreeProgramAbbreviation = this.urlParamService.findParam('abbreviation', this.route);

    this.userService.getUserRoles().subscribe({
      next: value => {
        this.userRoles = value;
      }
    });

    this.userService.getUsers([`dp=${this.degreeProgramAbbreviation}`, 'exclude=true']).subscribe({
      next: value => {
        this.users = value;
      }
    });
  }

  protected onAddToDegreeProgramClick(username: string) {
    this.degreeProgramService.createUserDegreeProgramConnection(username, this.degreeProgramAbbreviation).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.username !== username);
      }
    });
  }
}
