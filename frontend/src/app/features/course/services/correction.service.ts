import {Injectable} from '@angular/core';
import {Correction} from "../models/correction.model";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {FileDownloadService} from "../../../shared/services/file-download.service";

@Injectable({
  providedIn: 'root'
})
export class CorrectionService {

  constructor(private http: HttpClient,
              private fileDownloadService: FileDownloadService) {
  }

  patchCorrection(correctionId: number, patch: any) {
    return this.http.patch<Correction>(`correction/${correctionId}/`, patch)
  }

  createCorrection(studentId: number, assignmentId: number, status: string | undefined = undefined) {
    const body: any = {
      studentId: studentId,
      assignmentId: assignmentId
    }
    if (status !== undefined) {
      body.status = status;
    }
    return this.http.post<Correction>('correction/create/', body);
  }

  deleteCorrection(correctionId: number) {
    return this.http.delete(`correction/${correctionId}/`);
  }

  getCorrection(correctionId: number) {
    return this.http.get<Correction>(`correction/${correctionId}/`);
  }

  downloadCorrection(studentId: number, courseId: number, assignmentId: number) {
    const body = {
      student_id: studentId,
      course_id: courseId,
      assignment_id: assignmentId
    }
    return this.http.post<HttpResponse<Blob>>('download-correction/', body, {
      observe: 'response',
      responseType: 'blob' as 'json'
    }).subscribe({
      next: value => {
        this.fileDownloadService.download(value.body, value.headers.get('filename')!);
      }
    });
  }
}
