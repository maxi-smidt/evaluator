import {Injectable} from '@angular/core';
import {Assignment} from "../interfaces/assignment";
import {Correction} from "../interfaces/correction";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {FileDownloadService} from "./file-download.service";

@Injectable({
  providedIn: 'root'
})
export class CorrectionService {

  constructor(private http: HttpClient,
              private fileDownloadService: FileDownloadService) {
  }

  setCorrectionState(studentId: number, courseId: number, assignmentId: number, state: string) {
    const body = {
      student_id: studentId,
      course_id: courseId,
      assignment_id: assignmentId,
      state: state
    }
    return this.http.post<Assignment>('set-correction-state/', body);
  }

  deleteCorrection(studentId: number, courseId: number, assignmentId: number) {
    const body = {
      student_id: studentId,
      course_id: courseId,
      assignment_id: assignmentId
    }
    return this.http.post<Assignment>('delete-correction/', body);
  }

  getCorrection(studentId: number, courseId: number, assignmentId: number) {
    const body = {
      student_id: studentId,
      course_id: courseId,
      assignment_id: assignmentId
    }
    return this.http.post<{ correction: Correction, lock: boolean }>('get-correction/', body);
  }

  saveCorrection(studentId: number, courseId: number, assignmentId: number, correction: Correction) {
    const body = {
      student_id: studentId,
      course_id: courseId,
      assignment_id: assignmentId,
      correction: correction
    }
    return this.http.post<Correction>('save-correction/', body);
  }

  downloadCorrection(studentId: number, courseId: number, assignmentId: number) {
    const body = {
      student_id: studentId,
      course_id: courseId,
      assignment_id: assignmentId
    }
    return this.http.post<HttpResponse<Blob>>('download-correction/', body, { observe: 'response', responseType: 'blob' as 'json' }).subscribe({
      next: value => {
        this.fileDownloadService.download(value.body, value.headers.get('filename')!);
      }
    });
  }
}
