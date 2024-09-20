export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  startYear: number;
}

export interface AssignmentStudent extends Student {
  points: number;
  correctionId: number;
  status: string;
}
