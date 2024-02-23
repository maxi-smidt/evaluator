import {Injectable} from '@angular/core';
import {BaseApiService} from "./base-api.service";
import {Course} from "../interfaces/course";
import {Assignment} from "../interfaces/assignment";
import {BaseStudent} from "../interfaces/base-student";
import {EditPartition} from "../interfaces/edit-partition";

@Injectable({
  providedIn: 'root'
})
export class CourseService extends BaseApiService {

  getFullCourse(courseId: number) {
    const params: string = `course_id=${courseId}`;
    return this.http.get<Course>(this.baseUrl + `get-exercises?${params}`);
  }

  getFullExercise(courseId: number, assignmentId: number) {
    const params: string = `course_id=${courseId}&assignment_id=${assignmentId}`;
    return this.http.get<Assignment>(this.baseUrl + `get-exercise?${params}`);
  }

  getStudentsInGroupsByCourse(courseId: number) {
    const params: string = `course_id=${courseId}`;
    return this.http.get<{ [groupNr: string]: BaseStudent[] }>(this.baseUrl + `students-course-group/?${params}`);
  }

  setStudentsCourseGroup(courseId: number, students: { [groupNr: string]: BaseStudent[] }) {
    const body = {
      students: students,
      course_id: courseId
    }
    return this.http.post<{ [groupNr: string]: BaseStudent[] }>(this.baseUrl + 'students-course-group/', body);
  }

  getTutorAssignmentPartition(courseId: number) {
    const params: string = `course_id=${courseId}`;
    return this.http.get<{partition: EditPartition[], groups: number[]}>(this.baseUrl + `get-course-partition?${params}`);
  }

  setAssignmentPartition(courseId: number, partition: EditPartition[]) {
    const body = {
      partition: partition,
      course_id: courseId
    }
    return this.http.post<any>(this.baseUrl + 'set-course-partition/', body);
  }
}
