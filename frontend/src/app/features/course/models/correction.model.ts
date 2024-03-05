import {Student} from "./student.model";

export interface Correction {
  id: number,
  student: Student,
  assignment: CorrectionAssignment
  expense: number,
  points: number,
  status: string,
  draft: Draft
}

interface CorrectionAssignment {
  name: string,
  points: number
}

interface Draft {
  annotations: Entry[];
  exercise: Exercise[];
}

interface Exercise {
  name: string;
  sub: SubExercise[];
}

interface SubExercise {
  name: string;
  points: number;
  notes: Entry[];
}

export interface Entry {
  text: string,
  points: number
}
