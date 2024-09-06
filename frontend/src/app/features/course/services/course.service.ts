import { Injectable } from '@angular/core';
import {
  Course,
  DetailCourse,
  SerializerType,
  SimpleCourseInstance,
} from '../models/course.model';
import { Student } from '../models/student.model';
import { HttpClient } from '@angular/common/http';
import { ChartData } from '../models/chart-data.model';
import { DegreeProgram } from '../../degree-program/models/degree-program.model';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  constructor(private http: HttpClient) {}

  createCourseInstance(courseId: number, year: number) {
    return this.http.post('course-instance/create/', {
      courseId: courseId,
      year: year,
    });
  }

  getCourseInstance<T extends SimpleCourseInstance>(
    courseId: number,
    level: SerializerType,
  ) {
    const extension = level === SerializerType.NORMAL ? '' : `?level=${level}`;
    return this.http.get<T>(`course-instance/${courseId}/${extension}`);
  }

  getCourseInstances(degreeProgramAbbreviation: string | null = null) {
    const extension =
      degreeProgramAbbreviation !== null
        ? `?dp=${degreeProgramAbbreviation}`
        : '';
    return this.http.get<SimpleCourseInstance[]>(
      `course-instances/${extension}`,
    );
  }

  patchCourseInstance<T extends SimpleCourseInstance>(
    courseId: number,
    level: SerializerType,
    patch: object,
  ) {
    const extension = level === SerializerType.NORMAL ? '' : `?level=${level}`;
    return this.http.patch<T>(
      `course-instance/${courseId}/${extension}`,
      patch,
    );
  }

  createCourse(degreeProgram: DegreeProgram, course: Course) {
    return this.http.post<Course>('course/create/', {
      degreeProgram: degreeProgram.name,
      ...course,
    });
  }

  getDetailCourse(courseId: number) {
    return this._getCourse<DetailCourse>(courseId, SerializerType.DETAIL);
  }

  private _getCourse<T>(courseId: number, level: SerializerType) {
    const extension = level === SerializerType.NORMAL ? '' : `?level=${level}`;
    return this.http.get<T>(`course/${courseId}/${extension}`);
  }

  getCourses(degreeProgramAbbreviation: string) {
    return this.http.get<Course[]>(`courses/?dp=${degreeProgramAbbreviation}`);
  }

  patchCourse(courseId: number, patch: object) {
    return this.http.patch<DetailCourse>(`course/${courseId}/`, patch);
  }

  getStudentsInGroupsByCourse(courseId: number) {
    return this.http.get<{ groupedStudents: { [groupNr: string]: Student[] } }>(
      `student-group/${courseId}/`,
    );
  }

  patchStudentsCourseGroup(
    courseId: number,
    students: { [groupNr: string]: Student[] },
  ) {
    return this.http.patch<{
      groupedStudents: { [groupNr: string]: Student[] };
    }>(`student-group/${courseId}/`, { groupedStudents: students });
  }

  getChartData(courseId: number) {
    return this.http.get<{ dataExpense: ChartData; dataPoints: ChartData }>(
      `course-chart/${courseId}/`,
    );
  }

  deleteCourseInstance(courseInstanceId: number) {
    return this.http.delete(`course-instance/${courseInstanceId}/`);
  }
}
