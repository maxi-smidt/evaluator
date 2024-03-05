import {Injectable} from '@angular/core';
import {xCourseInstance} from "../models/course.model";
import {Assignment} from "../models/assignment.model";
import {Student} from "../models/student.model";
import {EditPartition} from "../models/edit-partition.model";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(private http: HttpClient) {
  }

  getFullCourse(courseId: number) {
    return this.http.get<xCourseInstance>(`course/${courseId}/`);
  }

  getFullAssignment(assignmentId: number) {
    return this.http.get<Assignment>(`assignment/${assignmentId}/`);
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