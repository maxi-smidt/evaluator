import {Injectable} from '@angular/core';
import {Correction} from "../models/correction.model";
import {HttpClient} from "@angular/common/http";
import {FileDownloadService} from "../../../shared/services/file-download.service";

@Injectable({
  providedIn: 'root'
})
export class CorrectionService {

  constructor(private http: HttpClient,
              private fileDownloadService: FileDownloadService) {
  }

  patchCorrection(correctionId: number, patch: unknown) {
    return this.http.patch<Correction>(`correction/${correctionId}/`, patch)
  }

  createCorrection(studentId: string, assignmentId: number, status: string | undefined = undefined) {
    const body: {studentId: string, assignmentId: number, status?: string} = {
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

  downloadCorrection(correctionId: number) {
    return this.http.get<Blob>(`correction/download/${correctionId}/`, {
      observe: 'response',
      responseType: 'blob' as 'json'
    }).subscribe({
      next: value => {
        this.fileDownloadService.download(value.body!, value.headers.get('filename')!);
      }
    });
  }
}
