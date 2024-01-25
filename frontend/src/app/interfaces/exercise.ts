import {BaseExercise} from "./base-exercise";
import {BaseStudent} from "./base-student";

export interface Exercise extends BaseExercise {
  studentExercises: { [groupNr: string]: BaseStudent[] };
}
