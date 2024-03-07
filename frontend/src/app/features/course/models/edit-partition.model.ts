import {SimpleUser} from "../../../core/models/user.models";

export interface EditAssignment {
  id: string
  assignmentName: string,
  groups: number[]
}

export interface EditPartition {
  tutor: SimpleUser;
  assignments: EditAssignment[];
}
