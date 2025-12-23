import { Component, inject } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { TranslationService } from '../../../../shared/services/translation.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ButtonModule } from 'primeng/button';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-degree-program-list',
  templateUrl: './degree-program-list.component.html',
  imports: [TranslatePipe, ButtonModule],
})
export class DegreeProgramListComponent {
  private readonly adminService = inject(AdminService);
  private readonly translationService = inject(TranslationService);

  protected tableHeader: string[] = this.translationService.getArray(
    'home.adminHome.degreeProgramList.table-header',
  );

  protected readonly degreePrograms = toSignal(
    this.adminService.getDegreePrograms(),
  );
}
