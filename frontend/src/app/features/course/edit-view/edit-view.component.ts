import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ConfirmationService, MessageService} from 'primeng/api';
import {Student} from "../models/student.model";
import {EditPartition} from "../models/edit-partition.model";
import {CourseService} from "../services/course.service";
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {EditGroupComponent} from "./edit-group/edit-group.component";
import {EditPartitionComponent} from "./edit-partition/edit-partition.component";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";

@Component({
  selector: 'ms-edit-view',
  templateUrl: './edit-view.component.html',
  standalone: true,
  imports: [
    ToastModule,
    ConfirmDialogModule,
    EditGroupComponent,
    EditPartitionComponent,
    TranslatePipe
  ]
})
export class EditViewComponent implements OnInit {
  courseId: number = -1;
  groupedStudents: { [groupNr: string]: Student[] } = {};
  groupedStudentsBefore: { [groupNr: string]: Student[] } = {};

  partition: EditPartition[] = [];
  partitionBefore: EditPartition[] = [];
  groups: number[] = [];

  constructor(private courseService: CourseService,
              private route: ActivatedRoute,
              private confirmationService: ConfirmationService,
              private messageService: MessageService) {
  }

  ngOnInit() {
    this.courseId = this.route.parent!.snapshot.params['courseId'];
    this.courseService.getStudentsInGroupsByCourse(this.courseId).subscribe({
      next: students => {
        this.groupedStudents = students.groupedStudents;
        this.adjustInactiveGroup();
        this.groupedStudentsBefore = JSON.parse(JSON.stringify(students));
      }
    });

    this.courseService.getTutorAssignmentPartition(this.courseId).subscribe({
      next: value => {
        this.partition = value.partition;
        this.partitionBefore = JSON.parse(JSON.stringify(value.partition));
        this.groups = value.groups;
      }
    });
  }

  adjustInactiveGroup() {
    if (!('-1' in this.groupedStudents)) {
      this.groupedStudents['-1'] = [];
    }
  }

  private hasChanged() {
    return this.groupHasChanged() || this.partitionHasChanged();
  }

  private groupHasChanged() {
    return JSON.stringify(this.groupedStudents) !== JSON.stringify(this.groupedStudentsBefore);
  }

  private partitionHasChanged() {
    return JSON.stringify(this.partition) !== JSON.stringify(this.partitionBefore);
  }

  checkChanges() {
    if (!this.hasChanged()) {
      return true;
    }
    return this.confirmDialog().then(
      result => {
        return result;
      }
    )
  }

  private confirmDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: 'You have unsaved changes, are you sure you want to proceed?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon: "none",
        rejectIcon: "none",
        rejectButtonStyleClass: "p-button-text",
        accept: () => {
          resolve(true);
        },
        reject: () => {
          resolve(false);
        }
      });
    });
  }

  onSaveBtnClick() {
    if (!this.hasChanged()) {
      this.messageService.add({severity: 'info', summary: 'Info', detail: 'No changes detected'});
      return;
    }

    if (this.groupHasChanged()) {
      this.courseService.setStudentsCourseGroup(this.courseId, this.groupedStudents).subscribe({
        next: groupedStudents => {
          this.groupedStudents = groupedStudents.groupedStudents;
          this.groupedStudentsBefore = JSON.parse(JSON.stringify(this.groupedStudents));
        }
      });
    }

    if (this.partitionHasChanged()) {
      this.courseService.putAssignmentPartition(this.courseId, this.partition).subscribe({
        next: () => {
          this.partitionBefore = JSON.parse(JSON.stringify(this.partition));
        }
      });
    }
  }
}
