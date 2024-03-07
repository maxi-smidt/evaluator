import {Component, OnInit} from '@angular/core';
import {AdminService} from "../../services/admin.service";
import {TranslationService} from "../../../../shared/services/translation.service";
import {TranslatePipe} from "../../../../shared/pipes/translate.pipe";
import {ButtonModule} from "primeng/button";
import {AdminDegreeProgram} from "../../../degree-program/models/degree-program.model";


@Component({
  selector: 'ms-degree-program-list',
  templateUrl: './degree-program-list.component.html',
  standalone: true,
  imports: [
    TranslatePipe,
    ButtonModule
  ]
})
export class DegreeProgramListComponent implements OnInit {
  tableHeader: string[];
  degreePrograms: AdminDegreeProgram[] = [];

  constructor(private adminService: AdminService,
              private translationService: TranslationService) {
    this.tableHeader = this.translationService.getArray('home.adminHome.degreeProgramList.table-header');
  }

  ngOnInit() {
    this.adminService.getDegreePrograms().subscribe({
      next: value => {
        this.degreePrograms = value;
      }
    });
  }
}
