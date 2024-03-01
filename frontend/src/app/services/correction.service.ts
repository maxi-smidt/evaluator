import {Injectable} from '@angular/core';
import {BaseApiService} from "./base-api.service";
import {Assignment} from "../interfaces/assignment";
import {Correction} from "../interfaces/correction";
import {Router} from "@angular/router";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {FileDownloadService} from "./file-download.service";

@Injectable({
  providedIn: 'root'
})
export class CorrectionService extends BaseApiService {

  constructor(http: HttpClient,
              router: Router,
              private fileDownloadService: FileDownloadService) {
    super(http, router);
  }

  setCorrectionState(studentId: number, courseId: number, assignmentId: number, state: string) {
    const body = {
      student_id: studentId,
      course_id: courseId,
      assignment_id: assignmentId,
      state: state
    }
    return this.http.post<Assignment>(this.baseUrl + 'set-correction-state/', body);
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
    return this.http.post<{ correction: Correction, lock: boolean }>(this.baseUrl + 'get-correction/', body);
  }

  saveCorrection(studentId: number, courseId: number, assignmentId: number, correction: Correction) {
    const body = {
      student_id: studentId,
      course_id: courseId,
      assignment_id: assignmentId,
      correction: correction
    }
    return this.http.post<Correction>(this.baseUrl + 'save-correction/', body);
  }

  downloadCorrection(studentId: number, courseId: number, assignmentId: number) {
    const body = {
      student_id: studentId,
      course_id: courseId,
      assignment_id: assignmentId
    }
    return this.http.post<HttpResponse<Blob>>(this.baseUrl + 'download-correction/', body, { observe: 'response', responseType: 'blob' as 'json' }).subscribe({
      next: value => {
        this.fileDownloadService.download(value.body, value.headers.get('filename')!);
      }
    });
  }
}
