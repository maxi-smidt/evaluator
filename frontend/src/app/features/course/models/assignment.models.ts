import {Student} from "./student.models";

export interface Assignment extends BaseAssignment {
  studentExercises: { [groupNr: string]: Student[] };
}

export interface BaseAssignment {
  id: number,
  name: string,
  dueTo: Date,
  state: string,
  maxParticipants: number,
  correctedParticipants: number
}
