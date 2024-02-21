import {BaseAssignment} from "./base-assignment";
import {BaseStudent} from "./base-student";

export interface Assignment extends BaseAssignment {
  studentExercises: { [groupNr: string]: BaseStudent[] };
}
