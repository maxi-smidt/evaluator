import {Injectable} from '@angular/core';
import {Course} from "../models/course.models";
import {Assignment} from "../models/assignment.models";
import {Student} from "../models/student.models";
import {EditPartition} from "../models/edit-partition.models";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(private http: HttpClient) {
  }

  getFullCourse(courseId: number) {
    const params: string = `course_id=${courseId}`;
    return this.http.get<Course>(`get-exercises?${params}`);
  }

  getFullExercise(courseId: number, assignmentId: number) {
    const params: string = `course_id=${courseId}&assignment_id=${assignmentId}`;
    return this.http.get<{ assignment: Assignment, targetGroups: number[] }>(`get-assignment?${params}`);
  }

  getStudentsInGroupsByCourse(courseId: number) {
    const params: string = `course_id=${courseId}`;
    return this.http.get<{ [groupNr: string]: Student[] }>(`students-course-group/?${params}`);
  }

  setStudentsCourseGroup(courseId: number, students: { [groupNr: string]: Student[] }) {
    const body = {
      students: students,
      course_id: courseId
    }
    return this.http.post<{ [groupNr: string]: Student[] }>('students-course-group/', body);
  }

  getTutorAssignmentPartition(courseId: number) {
    const params: string = `course_id=${courseId}`;
    return this.http.get<{ partition: EditPartition[], groups: number[] }>(`get-course-partition?${params}`);
  }

  setAssignmentPartition(courseId: number, partition: EditPartition[]) {
    const body = {
      partition: partition,
      course_id: courseId
    }
    return this.http.post('set-course-partition/', body);
  }
}
