import { Component, effect, input } from '@angular/core';
import { CourseInstance } from '../../../models/course.model';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { InputNumberModule } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TranslationService } from '../../../../../shared/services/translation.service';

@Component({
  selector: 'ms-edit-general',
  imports: [
    InputSwitchModule,
    FormsModule,
    TranslatePipe,
    InputNumberModule,
    Button,
    InputTextModule,
    TooltipModule,
  ],
  templateUrl: './edit-general.component.html',
})
export class EditGeneralComponent {
  course = input.required<CourseInstance>();

  constructor(protected translationService: TranslationService) {
    effect(() => {
      if (!this.course().allowLateSubmission) {
        this.course().lateSubmissionPenalty = null;
      }
    });
  }
}
