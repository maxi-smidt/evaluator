import {Component, OnInit} from '@angular/core';
import {FieldsetModule} from "primeng/fieldset";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";
import {UserFormComponent} from "../../../shared/forms/user-form/user-form.component";
import {TranslationService} from "../../../shared/services/translation.service";
import {DpdService} from "../services/dpd.service";
import {DegreeProgram} from "../../degree-program/models/degree-program.model";
import {ButtonModule} from "primeng/button";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'ms-dpd-home',
  standalone: true,
  imports: [
    FieldsetModule,
    TranslatePipe,
    UserFormComponent,
    ButtonModule
  ],
  templateUrl: './dpd-home.component.html'
})
export class DpdHomeComponent implements OnInit {
  degreePrograms: DegreeProgram[] = [];
  userFormChoices: string[] = [];


  constructor(private dpdService: DpdService,
              private translationService: TranslationService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.userFormChoices = this.translationService.getArray('home.dpdHome.role-choices');
    this.dpdService.getDegreePrograms().subscribe({
      next: value => {
        this.degreePrograms = value;
      }
    });
  }

  onDegreeProgramClick(dp: DegreeProgram) {
    this.router.navigate(['degree-program', dp.abbreviation]).then();
  }
}
