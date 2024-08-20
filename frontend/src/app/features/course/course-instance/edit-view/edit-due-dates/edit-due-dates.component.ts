import {Component, model} from '@angular/core';
import {CalendarModule} from "primeng/calendar";
import {FormsModule} from "@angular/forms";
import {DueDateCourseInstance} from "../../../models/course.model";
import {AccordionModule} from "primeng/accordion";
import {TranslatePipe} from "../../../../../shared/pipes/translate.pipe";
import {AssignmentService} from "../../../../assignment/services/assignment.service";
import {ConfirmPopupModule} from "primeng/confirmpopup";
import {ConfirmationService} from "primeng/api";
import {TranslationService} from "../../../../../shared/services/translation.service";

@Component({
  selector: 'ms-edit-due-dates',
  standalone: true,
  imports: [
    CalendarModule,
    FormsModule,
    AccordionModule,
    TranslatePipe,
    ConfirmPopupModule
  ],
  templateUrl: './edit-due-dates.component.html'
})
export class EditDueDatesComponent {
  courseInstance = model.required<DueDateCourseInstance>();

  equalTime: Date | undefined;

  constructor(private assignmentService: AssignmentService,
              private confirmationService: ConfirmationService,
              private translationService: TranslationService) {
  }

  setDefaultDate() {
    if (this.equalTime === undefined) {
      return;
    }
    this.courseInstance().assignments.forEach(assignment => {
      const dueTo = new Date(assignment.dueTo);
      dueTo.setHours(this.equalTime!.getHours());
      dueTo.setMinutes(this.equalTime!.getMinutes());
      dueTo.setSeconds(0);
      dueTo.setMilliseconds(0);
      assignment.dueTo = dueTo;
    });
  }

  onDeleteAssignmentInstance(event: Event, assignmentInstanceId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translationService.translate('common.confirmation.message'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translationService.translate('common.confirmation.accept'),
      rejectLabel: this.translationService.translate('common.confirmation.reject'),
      accept: () => {
        this.assignmentService.deleteAssignmentInstance(assignmentInstanceId).subscribe({
          next: value => {
            this.courseInstance().assignments = this.courseInstance().assignments.filter(assignment => assignmentInstanceId !== assignment.id);
          }
        });
      }
    });
  }
}
