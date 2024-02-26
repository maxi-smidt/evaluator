import {Component, OnInit} from '@angular/core';
import {AdminService} from "../../../../../services/admin.service";
import {ConfirmationService} from "primeng/api";
import {TranslationService} from "../../../../../services/translation.service";

@Component({
  selector: 'ms-degree-program-list',
  templateUrl: './degree-program-list.component.html'
})
export class DegreeProgramListComponent implements OnInit {
  tableHeader: string[];
  degreePrograms: { name: string, abbreviation: string, dpd: string }[] = [];

  constructor(private adminService: AdminService,
              private confirmationService: ConfirmationService,
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
