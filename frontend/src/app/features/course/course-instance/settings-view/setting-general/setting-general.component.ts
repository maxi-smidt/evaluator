import { Component, effect, input } from '@angular/core';
import { CourseInstance } from '../../../models/course.model';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { InputNumberModule } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'ms-edit-general',
  imports: [
    ToggleSwitchModule,
    FormsModule,
    TranslatePipe,
    InputNumberModule,
    Button,
    InputTextModule,
    TooltipModule,
  ],
  templateUrl: './setting-general.component.html',
})
export class SettingGeneralComponent {
  public course = input.required<CourseInstance>();

  constructor() {
    effect(() => {
      if (this.course() && !this.course().allowLateSubmission) {
        this.course().lateSubmissionPenalty = null;
      }
    });
  }
}
