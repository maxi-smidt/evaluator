import {BaseAssignment} from "./assignment.models";

export interface Course extends BaseCourse {
  exercises: BaseAssignment[]
}

export interface BaseCourse {
  id: number,
  name: string
}
