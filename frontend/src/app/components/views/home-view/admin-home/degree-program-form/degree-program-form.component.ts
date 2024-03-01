import {Component, OnInit} from '@angular/core';
import {AdminService} from "../../../../../services/admin.service";
import {FormBuilder} from "@angular/forms";
import {MessageService} from "primeng/api";
import {TranslationService} from "../../../../../shared/services/translation.service";

@Component({
  selector: 'ms-degree-program-form',
  templateUrl: './degree-program-form.component.html'
})
export class DegreeProgramFormComponent implements OnInit {
  degreeProgramDirectorChoices: {name: string, id: string}[] = [];

  constructor(private adminService: AdminService,
              private formBuilder: FormBuilder,
              protected messageService: MessageService,
              private translationService: TranslationService) {
  }

  ngOnInit() {
    this.adminService.getDegreeProgramDirectors().subscribe({
      next: value => {
        this.degreeProgramDirectorChoices = value;
      }
    });
  }

  checkoutForm = this.formBuilder.group({
    name: '', abbreviation: '', id: ''
  });

  onSubmit() {
    if (this.checkoutForm.valid) {
      this.adminService.registerDegreeProgram(this.checkoutForm.value as {name: string, abbreviation: string, id: string}).subscribe({
        next: () => {
          this.checkoutForm.reset();
        },
        error: err => {
          if (err.status == 500) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.translationService.get('homeView.adminHome.degreeProgramForm.error-500')
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.translationService.get('homeView.adminHome.degreeProgramForm.error-else')
            });
          }
        }
      });
    }
  }
}
