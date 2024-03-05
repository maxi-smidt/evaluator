export interface Student {
  id: number,
  firstName: string,
  lastName: string
}

export interface AssignmentStudent extends Student {
  points: number,
  correctionId: number,
  status: string
}
