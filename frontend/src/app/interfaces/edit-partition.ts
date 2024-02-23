export interface EditTutor {
  name: string,
  id: string
}

export interface EditAssignment {
  name: string,
  id: string
}

export interface EditPartition {
  tutor: EditTutor;
  assignment: EditAssignment;
  groups: number[];
}
