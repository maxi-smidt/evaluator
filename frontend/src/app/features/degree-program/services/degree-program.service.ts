import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DegreeProgram } from '../models/degree-program.model';
import {
  ClassGroup,
  DetailClassGroup,
  SimpleClassGroup,
} from '../models/class-group.model';
import { Student } from '../../course/models/student.model';

@Injectable({
  providedIn: 'root',
})
export class DegreeProgramService {
  private http = inject(HttpClient);

  getDegreeProgram(abbreviation: string) {
    return this.http.get<DegreeProgram>(`degree-program/${abbreviation}/`);
  }

  createUserDegreeProgramConnection(username: string, abbreviation: string) {
    return this.http.post('user-degree-program/create/', {
      username: username,
      abbreviation: abbreviation,
    });
  }

  removeUserDegreeProgramConnection(username: string, abbreviation: string) {
    return this.http.delete(`user-degree-program/${username}&${abbreviation}/`);
  }

  getClassGroups(abbreviation: string) {
    return this.http.get<ClassGroup[]>(`class-groups/${abbreviation}/`);
  }

  getClassGroup(classGroupId: string) {
    return this.http.get<DetailClassGroup>(`class-group/${classGroupId}/`);
  }

  createClassGroup(abbreviation: string, startYear: number) {
    return this.http.post<SimpleClassGroup>('class-group/create/', {
      startYear,
      degreeProgramAbbreviation: abbreviation,
    });
  }

  enrollStudents(courseInstanceId: number, students: Student[]) {
    const transformedStudents = students.map((student) => ({
      student: student.id,
      courseInstance: courseInstanceId,
    }));
    return this.http.post('course_enrollment/create/', transformedStudents);
  }

  unEnrollStudent(courseInstanceId: number, student: Student) {
    return this.http.delete(
      `course_enrollment/?student_id=${student.id}&course_instance_id=${courseInstanceId}`,
    );
  }
}
