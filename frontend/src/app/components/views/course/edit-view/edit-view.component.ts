import {Component, OnInit} from '@angular/core';
import {BaseStudent} from "../../../../interfaces/base-student";
import {CourseService} from "../../../../services/course.service";
import {ActivatedRoute} from "@angular/router";
import {ConfirmationService, MessageService} from 'primeng/api';

@Component({
  selector: 'ms-edit-view',
  templateUrl: './edit-view.component.html',
  styleUrls: ['./edit-view.component.css'],
})
export class EditViewComponent implements OnInit {
  courseId: number;
  groupedStudents: { [groupNr: string]: BaseStudent[] };
  groupedStudentsOrg: { [groupNr: string]: BaseStudent[] };

  draggedStudent: { student: BaseStudent, group: number } | undefined | null;

  constructor(private courseService: CourseService,
              private route: ActivatedRoute,
              private confirmationService: ConfirmationService,
              private messageService: MessageService) {
    this.courseId = -1;
    this.groupedStudents = {};
    this.groupedStudentsOrg = {};
  }

  ngOnInit() {
    this.courseId = this.route.parent!.snapshot.params['courseId'];
    this.courseService.getStudentsInGroupsByCourse(this.courseId).subscribe({
      next: students => {
        this.groupedStudents = students;
        this.adjustInactiveGroup();
        this.groupedStudentsOrg = JSON.parse(JSON.stringify(students));
      }
    });
  }

  adjustInactiveGroup() {
    if (!('-1' in this.groupedStudents)) {
      this.groupedStudents['-1'] = [];
    }
  }

  get groupNrs() {
    return Object.keys(this.groupedStudents);
  }

  dragStart(student: BaseStudent, group: string) {
    this.draggedStudent = {student: student, group: Number(group)};
  }

  drop(groupNr: string) {
    const newGroup = Number(groupNr);
    const oldGroup = this.draggedStudent!.group;
    if (oldGroup !== newGroup) {
      const student = this.draggedStudent!.student;
      this.insertSorted(student, newGroup);
      this.deleteStudent(student, oldGroup);
      this.draggedStudent = null;
    }
  }

  private insertSorted(student: BaseStudent, group: number) {
    const index = this.groupedStudents[group].findIndex(x => x.lastName > student.lastName);

    if (index === -1) {
      this.groupedStudents[group].push(student);
    } else {
      this.groupedStudents[group].splice(index, 0, student);
    }
  }

  private deleteStudent(student: BaseStudent, group: number) {
    const index = this.findIndex(group, student);
    this.groupedStudents[group] = this.groupedStudents[group].filter((val, i) => i != index);
  }

  dragEnd() {
    this.draggedStudent = null;
  }

  private findIndex(group: number, student: BaseStudent) {
    let index = -1;
    for (let i = 0; i < (this.groupedStudents[group]).length; i++) {
      if (student.id === this.groupedStudents[group][i].id) {
        index = i;
        break;
      }
    }
    return index;
  }

  private hasChanged() {
    return JSON.stringify(this.groupedStudents) !== JSON.stringify(this.groupedStudentsOrg);
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
    return new Promise((resolve, reject) => {
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
    this.courseService.setStudentsCourseGroup(this.courseId, this.groupedStudents).subscribe({
      next: () => {
        this.groupedStudentsOrg = this.groupedStudents;
      }
    })
  }
}
