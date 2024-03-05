import {SimpleAssignment} from "./assignment.model";

export interface Course extends BaseCourse {
  exercises: SimpleAssignment[]
}

export interface BaseCourse {
  id: number,
  name: string
}

export interface xCourse {
  name: string,
  abbreviation: string
}

export interface xSimpleCourseInstance {
  id: number,
  year: number,
  course: xCourse
}

export interface xCourseInstance extends xSimpleCourseInstance {
  assignments: SimpleAssignment[];
}
