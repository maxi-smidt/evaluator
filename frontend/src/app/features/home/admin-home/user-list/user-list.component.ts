import {Component, OnInit} from '@angular/core';
import {ConfirmationService} from "primeng/api";
import {TranslationService} from "../../../../shared/services/translation.service";
import {AdminService} from "../../services/admin.service";
import {RegisteredUser} from "../../../../core/models/user.models";
import {TranslatePipe} from "../../../../shared/pipes/translate.pipe";
import {FormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";


@Component({
  selector: 'ms-user-list',
  templateUrl: './user-list.component.html',
  standalone: true,
    imports: [
        TranslatePipe,
        FormsModule,
        ButtonModule
    ]
})
export class UserListComponent implements OnInit {
  tableHeader: string[];
  users: RegisteredUser[] = [];
  usersChangeSet: RegisteredUser[] = [];

  constructor(private adminService: AdminService,
              private confirmationService: ConfirmationService,
              private translationService: TranslationService) {
    this.tableHeader = this.translationService.getArray('home.adminHome.userList.table-header');
  }


  ngOnInit() {
    this.adminService.getAllUsers().subscribe({
      next: value => {
        this.users = value;
      }
    });
  }

  onActivityChange(user: RegisteredUser) {
    const idx = this.usersChangeSet.findIndex(u => u.username === user.username);
    if (idx === -1) {
      this.usersChangeSet.push(user);
    } else {
      this.usersChangeSet.splice(idx, 1);
    }
  }

  onActivitySave() {
    if (!this.usersChangeSet.length) {
      return;
    }
    this.confirmDialog().then(
      save => {
        if (save) {
          this.adminService.changeUserActivityState(this.usersChangeSet).subscribe({
            next: () => {
              this.usersChangeSet = [];
            }
          });
        }
      }
    );
  }

  private confirmDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: this.makeConfirmationMessage(),
        header: this.translationService.translate('home.adminHome.userList.conf-header'),
        icon: 'pi pi-exclamation-triangle',
        acceptIcon: "none",
        rejectIcon: "none",
        rejectButtonStyleClass: "p-button-text",
        accept: () => {
          resolve(true);
        },
        reject: () => {
          resolve(false);
        }
      });
    });
  }

  private makeConfirmationMessage() {
    return 'Changing:<br>' + this.usersChangeSet
      .map(user => `${user.lastName} ${user.firstName} (${user.role}) ->
        ${this.translationService.translate('home.adminHome.userList.' + (user.isActive ? 'active' : 'inactive'))}`)
      .join('<br>');
  }
}
