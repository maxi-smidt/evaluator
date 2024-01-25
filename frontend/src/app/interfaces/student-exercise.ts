import {BaseStudent} from "./base-student";

export interface BaseExercise extends BaseStudent {
  state: string,
  points: number
}
