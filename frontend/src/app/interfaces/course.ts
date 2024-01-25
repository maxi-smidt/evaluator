import {BaseCourse} from "./base-course";
import {BaseExercise} from "./base-exercise";

export interface Course extends BaseCourse {
  exercises: BaseExercise[]
}
