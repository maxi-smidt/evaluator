import {Injectable} from '@angular/core';
import {BaseApiService} from "./base-api.service";
import {Assignment} from "../interfaces/assignment";
import {Correction} from "../interfaces/correction";

@Injectable({
  providedIn: 'root'
})
export class CorrectionService extends BaseApiService {
  setCorrectionNotSubmitted(studentId: number, courseId: number, assignmentId: number) {
    const body = {
      student_id: studentId,
      course_id: courseId,
      assignment_id: assignmentId
    }
    return this.http.post<Assignment>(this.baseUrl + 'set-correction-not-submitted/', body);
  }

  deleteCorrection(studentId: number, courseId: number, assignmentId: number) {
    const body = {
      student_id: studentId,
      course_id: courseId,
      assignment_id: assignmentId
    }
    return this.http.post<Assignment>(this.baseUrl + 'delete-correction/', body);
  }

  getCorrection(studentId: number, courseId: number, assignmentId: number) {
    const body = {
      student_id: studentId,
      course_id: courseId,
      assignment_id: assignmentId
    }
    return this.http.post<Correction>(this.baseUrl + 'get-correction/', body)
  }
}
