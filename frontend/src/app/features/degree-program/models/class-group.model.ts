import { Student } from '../../course/models/student.model';

export interface SimpleClassGroup {
  id: number;
  startYear: number;
}

export interface ClassGroup extends SimpleClassGroup {
  participantCount: number;
}

export interface DetailClassGroup extends SimpleClassGroup {
  students: Student[];
}
