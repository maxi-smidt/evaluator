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
    return this.http.get<{ groupedStudents: { [groupNr: string]: Student[] } }>(`student-group/${courseId}/`);
  }

  setStudentsCourseGroup(courseId: number, students: { [groupNr: string]: Student[] }) {
    return this.http.patch<{
      groupedStudents: { [groupNr: string]: Student[] }
    }>(`student-group/${courseId}/`, {groupedStudents: students});
  }

  getTutorAssignmentPartition(courseId: number) {
    return this.http.get<{ partition: EditPartition[], groups: number[] }>(`course-partition/${courseId}/`);
  }

  putAssignmentPartition(courseId: number, partition: EditPartition[]) {
    return this.http.put(`course-partition/${courseId}/`, {partition: partition});
  }
}
