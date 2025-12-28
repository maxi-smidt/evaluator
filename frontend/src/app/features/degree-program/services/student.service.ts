import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SimpleClassGroup } from '../models/class-group.model';
import { Student } from '../../course/models/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private http = inject(HttpClient);

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

  createStudent(student: Student) {
    return this.http.post('student/create/', student);
  }

  getStudent(studentId: string) {
    return this.http.get<Student>(`student/${studentId}/`);
  }

  getStudents(queryParam: string, value: string | number) {
    return this.http.get<Student[]>(`students/?${queryParam}=${value}`);
  }
}
