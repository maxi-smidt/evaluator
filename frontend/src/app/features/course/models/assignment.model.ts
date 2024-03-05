import {AssignmentStudent} from "./student.model";

export interface Assignment extends SimpleAssignment {
  groupedStudents: { [groupNr: string]: AssignmentStudent[] };
  targetGroups: number[]
}

export interface SimpleAssignment {
  id: number,
  name: string,
  dueTo: Date,
  status: string,
  maxParticipants: number,
  correctedParticipants: number
}
