import {Component, input} from '@angular/core';
import {BaseStudent} from "../../../../../interfaces/base-student";

@Component({
  selector: 'ms-edit-group',
  templateUrl: './edit-group.component.html',
  styleUrl: './edit-group.component.css'
})
export class EditGroupComponent {
  groupedStudents = input.required<{ [groupNr: string]: BaseStudent[] }>();
  draggedStudent: { student: BaseStudent, group: number } | undefined | null;

  onAddGroupBtnClick() {
    const highestGroupNumber = Math.max(...Object.keys(this.groupedStudents()).map(Number));
    for (let i = 1; i <= highestGroupNumber + 1; ++i) {
      if (!(i in this.groupedStudents())) {
        this.groupedStudents()[i] = [];
        break;
      }
    }
  }

  get groupNrs() {
    return Object.keys(this.groupedStudents());
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
    const index = this.groupedStudents()[group].findIndex(x => x.lastName > student.lastName);

    if (index === -1) {
      this.groupedStudents()[group].push(student);
    } else {
      this.groupedStudents()[group].splice(index, 0, student);
    }
  }

  private deleteStudent(student: BaseStudent, group: number) {
    const index = this.findIndex(group, student);
    this.groupedStudents()[group] = this.groupedStudents()[group].filter((val, i) => i != index);
  }

  dragEnd() {
    this.draggedStudent = null;
  }

  private findIndex(group: number, student: BaseStudent) {
    let index = -1;
    for (let i = 0; i < (this.groupedStudents()[group]).length; i++) {
      if (student.id === this.groupedStudents()[group][i].id) {
        index = i;
        break;
      }
    }
    return index;
  }
}
