import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {MessageService} from "primeng/api";
import {AdminService} from "../../services/admin.service";
import {TranslationService} from "../../../../shared/services/translation.service";
import {TranslatePipe} from "../../../../shared/pipes/translate.pipe";
import {ButtonModule} from "primeng/button";
import {AdminDegreeProgram} from "../../../degree-program/models/degree-program.model";
import {SimpleUser} from "../../../../core/models/user.models";

@Component({
  selector: 'ms-degree-program-form',
  templateUrl: './degree-program-form.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ButtonModule
  ]
})
export class DegreeProgramFormComponent implements OnInit {
  degreeProgramDirectorChoices: SimpleUser[] = [];
  adminDegreeProgramForm: FormGroup;

  constructor(private adminService: AdminService,
              private formBuilder: FormBuilder,
              protected messageService: MessageService,
              private translationService: TranslationService) {
    this.adminDegreeProgramForm = this.formBuilder.group({
      name: [''],
      abbreviation: [''],
      dpDirector: [null]
    });
  }

  ngOnInit() {
    this.adminService.getDegreeProgramDirectors().subscribe({
      next: value => {
        this.degreeProgramDirectorChoices = value;
      }
    });
  }

  onSubmit() {
    if (this.adminDegreeProgramForm.valid) {
      this.adminService.registerDegreeProgram(this.adminDegreeProgramForm.value as AdminDegreeProgram).subscribe({
        next: () => {
          this.adminDegreeProgramForm.reset();
        },
        error: err => {
          if (err.status == 500) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.translationService.translate('home.adminHome.degreeProgramForm.error-500')
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.translationService.translate('home.adminHome.degreeProgramForm.error-else')
            });
          }
        }
      });
    }
  }
}
