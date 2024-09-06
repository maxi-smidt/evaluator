import { Student } from '../../course/models/student.model';

export interface Correction {
  id: number;
  tutorUsername: string;
  student: Student;
  assignment: CorrectionAssignment;
  courseInstanceId: number;
  expense: string | null;
  points: number;
  status: CorrectionStatus;
  draft: CorrectionDraft;
  lateSubmittedDays: number;
}

interface CorrectionAssignment {
  name: string;
  points: number;
}

export interface CorrectionDraft {
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
  text: string;
  points: number;
}

export enum CorrectionStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  CORRECTED = 'CORRECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  UNDEFINED = 'UNDEFINED',
}
