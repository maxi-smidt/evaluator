import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Assignment, AssignmentInstance } from '../models/assignment.model';
import { EditPartition } from '../../course/models/edit-partition.model';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  constructor(private http: HttpClient) {}

  getFullAssignmentInstance(assignmentId: number) {
    return this.http.get<AssignmentInstance>(
      `assignment-instance/${assignmentId}/`,
    );
  }

  getTutorAssignmentPartition(courseId: number) {
    return this.http.get<{ partition: EditPartition[]; groups: number[] }>(
      `course-partition/${courseId}/`,
    );
  }

  putAssignmentPartition(courseId: number, partition: EditPartition[]) {
    return this.http.put<{ partition: EditPartition[]; groups: number[] }>(
      `course-partition/${courseId}/`,
      { partition: partition },
    );
  }

  getAssignment(assignmentId: number) {
    return this.http.get<Assignment>(`assignment/${assignmentId}/`);
  }

  putAssignment(assignment: Assignment) {
    return this.http.put<Assignment>(`assignment/${assignment.id}/`, {
      ...assignment,
    });
  }

  createAssignment(courseId: number, nr: number, name: string) {
    return this.http.post<Assignment>('assignment/create/', {
      course: courseId,
      nr,
      name,
    });
  }

  deleteAssignment(assignmentId: number) {
    return this.http.delete(`assignment/${assignmentId}/`);
  }

  deleteAssignmentInstance(assignmentInstanceId: number) {
    return this.http.delete(`assignment-instance/${assignmentInstanceId}/`);
  }
}
