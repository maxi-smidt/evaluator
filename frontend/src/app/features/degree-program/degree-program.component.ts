import {Component, OnInit} from '@angular/core';
import {FieldsetModule} from "primeng/fieldset";
import {TranslatePipe} from "../../shared/pipes/translate.pipe";
import {UserFormComponent} from "../../shared/forms/user-form/user-form.component";
import {TranslationService} from "../../shared/services/translation.service";

@Component({
  selector: 'ms-degree-program',
  standalone: true,
  imports: [
    FieldsetModule,
    TranslatePipe,
    UserFormComponent
  ],
  templateUrl: './degree-program.component.html'
})
export class DegreeProgramComponent {

  constructor(private translationService: TranslationService) {
  }


}
