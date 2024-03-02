export interface Correction {
  assignmentName: string,
  assignmentPoints: number,
  studentFullName: string,
  expense: number,
  points: number,
  status: string,
  draft: Draft
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
