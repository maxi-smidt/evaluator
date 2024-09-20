import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SimpleClassGroup } from '../models/class-group.model';
import { Student } from '../../course/models/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  constructor(private http: HttpClient) {}

  removeFromClassGroup(studentId: string) {
    return this.patchStudent(studentId, { classGroup: null });
  }

  changeClassGroup(studentId: string, classGroupId: number) {
    return this.patchStudent(studentId, { classGroup: classGroupId });
  }

  private patchStudent(studentId: string, patch: object) {
    return this.http.patch<SimpleClassGroup>(`student/${studentId}/`, patch);
  }

  createStudents(students: Student[]) {
    return this.http.post('student/create/', students);
  }

  getStudents(degreeProgramAbbreviation: string) {
    return this.http.get<Student[]>(`students/${degreeProgramAbbreviation}/`);
  }
}
