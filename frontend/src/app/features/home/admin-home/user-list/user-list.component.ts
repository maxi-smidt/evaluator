import { Component, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { TranslationService } from '../../../../shared/services/translation.service';
import { AdminService } from '../../services/admin.service';
import { DetailUser } from '../../../../core/models/user.models';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../../../core/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-user-list',
  templateUrl: './user-list.component.html',
  imports: [TranslatePipe, FormsModule, ButtonModule],
})
export class UserListComponent {
  private readonly adminService = inject(AdminService);
  private readonly userService = inject(UserService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translationService = inject(TranslationService);

  protected tableHeader: string[] = this.translationService.getArray(
    'home.adminHome.userList.table-header',
  );

  protected readonly users = toSignal(this.userService.getUsers());
  usersChangeSet: DetailUser[] = [];

  protected onActivityChange(user: DetailUser) {
    const idx = this.usersChangeSet.findIndex(
      (u) => u.username === user.username,
    );
    if (idx === -1) {
      this.usersChangeSet.push(user);
    } else {
      this.usersChangeSet.splice(idx, 1);
    }
  }

  protected onActivitySave() {
    if (!this.usersChangeSet.length) {
      return;
    }
    this.confirmDialog().then((save) => {
      if (save) {
        this.adminService
          .changeUserActivityState(this.usersChangeSet)
          .subscribe({
            next: () => {
              this.usersChangeSet = [];
            },
          });
      }
    });
  }

  private confirmDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: this.makeConfirmationMessage(),
        header: this.translationService.translate(
          'home.adminHome.userList.conf-header',
        ),
        icon: 'pi pi-exclamation-triangle',
        acceptIcon: 'none',
        rejectIcon: 'none',
        rejectButtonStyleClass: 'p-button-text',
        accept: () => {
          resolve(true);
        },
        reject: () => {
          resolve(false);
        },
      });
    });
  }

  private makeConfirmationMessage() {
    return (
      'Changing:<br>' +
      this.usersChangeSet
        .map(
          (user) => `${user.lastName} ${user.firstName} (${user.role}) ->
        ${this.translationService.translate('home.adminHome.userList.' + (user.isActive ? 'active' : 'inactive'))}`,
        )
        .join('<br>')
    );
  }
}
