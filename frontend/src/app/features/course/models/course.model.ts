import {
  DueDateAssignmentInstance,
  SimpleAssignment,
  SimpleAssignmentInstance,
} from '../../assignment/models/assignment.model';

export interface Course {
  id: number;
  name: string;
  abbreviation: string;
  fileName: string;
}

/**
 * Course and all its assignments.
 */
export interface DetailCourse extends Course {
  assignments: SimpleAssignment[];
}

export interface SimpleCourseInstance {
  id: number;
  year: number;
  course: Course;
}

export interface CourseInstance extends SimpleCourseInstance {
  allowLateSubmission: boolean;
  lateSubmissionPenalty: number | null;
  pointStepSize: number;
}

export interface DetailCourseInstance extends CourseInstance {
  assignments: SimpleAssignmentInstance[];
}

export interface DueDateCourseInstance extends SimpleCourseInstance {
  assignments: DueDateAssignmentInstance[];
}

export enum SerializerType {
  NORMAL = 'normal',
  DETAIL = 'detail',
  SIMPLE = 'simple',
  STAFF = 'staff', // a serializer, that adds cl / tutors to a course instance
  DUE_DATE = 'due_date', // a serializer, that contains all the assignment instances with their due date
}
