import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {
  download(data: BlobPart, fileName: string) {
    const blob = new Blob([data], {type: 'application/octet-stream'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
