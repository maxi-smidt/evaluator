export interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

export interface AssignmentStudent extends Student {
  points: number;
  correctionId: number;
  status: string;
}
