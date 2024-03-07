import {Component, computed, input} from '@angular/core';
import {EditAssignment, EditPartition} from "../../models/edit-partition.model";
import {MultiSelectModule} from "primeng/multiselect";
import {FormsModule} from "@angular/forms";
import {SimpleUser} from "../../../../core/models/user.models";

@Component({
  selector: 'ms-edit-partition',
  templateUrl: './edit-partition.component.html',
  standalone: true,
  imports: [
    MultiSelectModule,
    FormsModule
  ]
})
export class EditPartitionComponent {

  partition = input.required<EditPartition[]>();
  groups = input<number[]>();

  assignments = computed(() => {
    if (this.partition() === undefined || this.partition().length === 0) {
      return [] as EditAssignment[];
    }
    return this.partition()[0].assignments;
  });

  headers = computed(() => {
    const empty: SimpleUser = {firstName: '', lastName: '', username: ''};
    const headers = [empty];
    this.partition().forEach(p => headers.push(p.tutor));
    return headers
  })

  getGroupByTutorAndAssignment(username: string, assignmentId: string) {
    const partition = this.partition().find(p => p.tutor.username === username);
    return partition!.assignments.find(a => a.id === assignmentId)!.groups
  }

  setGroupByTutorAndAssignment(username: string, assignmentId: string, groupValue: number[]) {
    const partition = this.partition().find(p => p.tutor.username === username);
    partition!.assignments.find(a => a.id === assignmentId)!.groups = groupValue;
  }
}
