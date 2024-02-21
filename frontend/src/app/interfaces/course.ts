import {BaseCourse} from "./base-course";
import {BaseAssignment} from "./base-assignment";

export interface Course extends BaseCourse {
  exercises: BaseAssignment[]
}
