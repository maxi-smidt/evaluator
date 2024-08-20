import {AssignmentStudent} from "../../course/models/student.model";


export interface DueDateAssignmentInstance {
  id: number,
  name: string,
  dueTo: Date
}

export interface SimpleAssignmentInstance extends DueDateAssignmentInstance {
  status: string,
  participantsLeft: number
}

export interface AssignmentInstance extends SimpleAssignmentInstance {
  groupedStudents: { [groupNr: string]: AssignmentStudent[] };
  targetGroups: number[]
}

export interface SimpleAssignment {
  id: number
  name: string,
  points: number
}

export interface Assignment extends SimpleAssignment {
  draft: Exercise[],
  nr: number
}

interface Exercise {
  name: string,
  distribution: SubExercise[]
}

interface SubExercise {
  name: string,
  points: number
}
