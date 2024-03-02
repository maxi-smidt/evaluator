import {Component, OnInit} from '@angular/core';
import {ConfirmationService} from "primeng/api";
import {AdminService} from "../../services/admin.service";
import {TranslationService} from "../../../../shared/services/translation.service";
import {TranslatePipe} from "../../../../shared/pipes/translate.pipe";

@Component({
  selector: 'ms-degree-program-list',
  templateUrl: './degree-program-list.component.html',
  standalone: true,
  imports: [
    TranslatePipe
  ]
})
export class DegreeProgramListComponent implements OnInit {
  tableHeader: string[];
  degreePrograms: { name: string, abbreviation: string, dpd: string }[] = [];

  constructor(private adminService: AdminService,
              private translationService: TranslationService) {
    this.tableHeader = this.translationService.getArray('homeView.adminHome.degreeProgramList.table-header');
  }

  ngOnInit() {
    this.adminService.getDegreePrograms().subscribe({
      next: value => {
        this.degreePrograms = value;
      }
    });
  }
}
