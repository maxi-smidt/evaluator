import {Component, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {MessageService} from "primeng/api";
import {AdminService} from "../../services/admin.service";
import {TranslationService} from "../../../../shared/services/translation.service";
import {TranslatePipe} from "../../../../shared/pipes/translate.pipe";

@Component({
  selector: 'ms-degree-program-form',
  templateUrl: './degree-program-form.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe
  ]
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
              detail: this.translationService.translate('homeView.adminHome.degreeProgramForm.error-500')
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.translationService.translate('homeView.adminHome.degreeProgramForm.error-else')
            });
          }
        }
      });
    }
  }
}
