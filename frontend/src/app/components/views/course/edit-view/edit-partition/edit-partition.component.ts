import {AfterContentInit, AfterViewInit, Component, computed, input, OnInit} from '@angular/core';
import {EditAssignment, EditPartition, EditTutor} from "../../../../../interfaces/edit-partition";

@Component({
  selector: 'ms-edit-partition',
  templateUrl: './edit-partition.component.html',
  styleUrl: './edit-partition.component.css'
})
export class EditPartitionComponent {

  partition = input.required<EditPartition[]>();
  tutors = computed(() => {
    const allTutors = this.partition().map(partition => partition.tutor);
    const distinctTutors: EditTutor[] = [];
    allTutors.forEach(tutor => {
      if (!distinctTutors.some(distinctTutor => distinctTutor.id === tutor.id)) {
        distinctTutors.push(tutor);
      }
    });
    return distinctTutors;
  });

  groups = input<number[]>();

  tableHeader = computed(() => {
    let header: EditTutor[] = [{name: '', id: ''}];
    this.tutors().forEach(tutor => {
      header.push(tutor);
    });
    return header;
  });

  assignments = computed(() => {
    const allAssignments = this.partition().map(partition => partition.assignment);
    const distinctAssignments: EditAssignment[] = [];
    allAssignments.forEach(assignment => {
      if (!distinctAssignments.some(distinctAssignment => distinctAssignment.id === assignment.id)) {
        distinctAssignments.push(assignment);
      }
    });
    return distinctAssignments;
  });

  getGroupByTutorAndAssignment(tutorId: string, assignmentId: string) {
    const partition = this.partition().find(p => p.tutor.id === tutorId && p.assignment.id === assignmentId);
    return partition!.groups;
  }

  setGroupByTutorAndAssignment(tutorId: string, assignmentId: string, groupValue: number[]) {
    const partition = this.partition().find(p => p.tutor.id === tutorId && p.assignment.id === assignmentId);
    partition!.groups = groupValue;
  }
}
