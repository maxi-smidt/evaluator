import {Component, effect, input} from '@angular/core';
import {CourseInstance} from "../../../models/course.model";
import {InputSwitchModule} from "primeng/inputswitch";
import {FormsModule} from "@angular/forms";
import {TranslatePipe} from "../../../../../shared/pipes/translate.pipe";
import {InputNumberModule} from "primeng/inputnumber";

@Component({
  selector: 'ms-edit-general',
  standalone: true,
  imports: [
    InputSwitchModule,
    FormsModule,
    TranslatePipe,
    InputNumberModule
  ],
  templateUrl: './edit-general.component.html'
})
export class EditGeneralComponent {
  course = input.required<CourseInstance>();

  constructor() {
    effect(() => {
      if (!this.course().allowLateSubmission) {
        this.course().lateSubmissionPenalty = null;
      }
    });
  }
}
