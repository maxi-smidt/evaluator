import {Injectable} from '@angular/core';
import {BaseApiService} from "./base-api.service";
import {Course} from "../interfaces/course";
import {Exercise} from "../interfaces/exercise";
import {BaseStudent} from "../interfaces/base-student";

@Injectable({
  providedIn: 'root'
})
export class CourseService extends BaseApiService {

  getFullCourse(courseId: number) {
    const params: string = `course_id=${courseId}`;
    return this.http.get<Course>(this.baseUrl + `get-exercises?${params}`);
  }

  getFullExercise(courseId: number, exerciseId: number) {
    const params: string = `course_id=${courseId}&exercise_id=${exerciseId}`;
    return this.http.get<Exercise>(this.baseUrl + `get-exercise?${params}`);
  }

  getStudentsInGroupsByCourse(courseId: number) {
    const params: string = `course_id=${courseId}`;
    return this.http.get<{ [groupNr: string]: BaseStudent[] }>(this.baseUrl + `get-students?${params}`);
  }

  setStudentsCourseGroup(courseId: number, students: { [groupNr: string]: BaseStudent[] }) {
    const body = {
      'students': students,
      course_id: courseId
    }
    return this.http.post<any>(this.baseUrl + 'set-students-course-group/', body);
  }
}
