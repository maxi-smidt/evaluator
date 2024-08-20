import {Component, ViewChild} from '@angular/core';
import {
  FileSelectEvent, FileUpload,
  FileUploadModule,
} from "primeng/fileupload";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {BadgeModule} from "primeng/badge";
import * as JSZip from "jszip";
import {PlagScanService} from "./services/plag-scan.service";
import {MenuItem, MessageService} from "primeng/api";
import {TranslationService} from "../../shared/services/translation.service";
import {TranslatePipe} from "../../shared/pipes/translate.pipe";
import {BlockUIModule} from "primeng/blockui";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";
import {FileDownloadService} from "../../shared/services/file-download.service";

@Component({
  selector: 'ms-plag-scan',
  standalone: true,
  imports: [
    FileUploadModule,
    NgClass,
    BadgeModule,
    NgForOf,
    NgIf,
    TranslatePipe,
    BlockUIModule,
    ProgressSpinnerModule,
    DropdownModule,
    FormsModule
  ],
  templateUrl: './plag-scan.component.html'
})
export class PlagScanComponent {
  @ViewChild('fileUpload', {static: false}) fileUpload!: FileUpload;

  selectedFile: File | undefined;

  extensionExcludes: string[] = [];
  inclusionExcludes: string[] = [];

  isLoading: boolean = false;

  languages: MenuItem[] = [];
  selectedLanguage: MenuItem | undefined;

  constructor(private plagScanService: PlagScanService,
              private messageService: MessageService,
              protected translationService: TranslationService,
              private fileDownloadService: FileDownloadService) {
    this.extensionExcludes.push('.csv', '.jpeg', '.jpg', '.png', '.pdf', '.xlsx', '.user', '.filters', '.vcxproj', '.sln');
    this.inclusionExcludes.push('__MACOSX');

    this.languages.push({title: 'C++', label: 'cpp'});
    this.languages.push({title: 'Python', label: 'python3'});
    this.languages.push({title: 'Java', label: 'java'});
    this.languages.push({title: 'c', label: 'c'});
    this.languages.push({title: 'C#', label: 'csharp'});
    this.languages.push({title: 'JavaScript', label: 'javascript'});
    this.languages.push({title: 'TypeScript', label: 'typescript'});
    this.languages.push({title: 'R', label: 'rlang'});
    this.languages.push({title: 'Rust', label: 'rust'});
    this.languages.push({title: 'Kotlin', label: 'kotlin'});
    this.languages.push({title: 'Scala', label: 'scala'});
  }

  onUpload() {
    if (this.selectedFile === undefined) {
      return;
    }
    this.isLoading = true;
    const formData = new FormData();
    formData.append('zipfile', this.selectedFile, this.selectedFile.name);

    this.plagScanService.scanZipFile(formData, this.selectedLanguage!.label!).subscribe({
      next: value => {
        const blob = new Blob([value.body], {type: 'application/zip'});
        window.open(this.translationService.translate('plag-scan.jplag-url'), '_blank');
        this.fileDownloadService.download(blob, this.translationService.translate('plag-scan.result'));
        this.messageService.add({
          severity: 'info',
          summary: "Info",
          "detail": this.translationService.translate('plag-scan.success')
        });
        this.fileUpload.clear();
        this.isLoading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.translationService.translate('plag-scan.error')
        });
        this.isLoading = false;
      }
    });
  }

  async processZipFile(event: FileSelectEvent) {
    this.isLoading = true;
    let file = event.currentFiles[0];
    const zip = await JSZip.loadAsync(file);
    this.selectedFile = <File>await this.unZipAndReZip(zip);
    this.isLoading = false;
  }

  async unZipAndReZip(zipContent: JSZip) {
    const newZip = new JSZip();
    await this.processZip(zipContent, newZip);
    return await newZip.generateAsync({type: 'blob'});
  }

  async processZip(zip: JSZip, newZip: JSZip) {
    const entries: any[] = [];

    zip.forEach((path, file) => {
      if (path.endsWith('.zip') && !path.includes('__MACOSX')) {
        entries.push({path, file});
      } else if (this.shouldInclude(path)) {
        file.async('blob').then(blob => {
          if (!path.includes('assignsubmission_file')) {
            newZip.file(path, blob);
          }
        });
      }
    });

    for (const {file} of entries) {
      const arrayBuffer = await file.async('arraybuffer');
      const nestedZip = await JSZip.loadAsync(arrayBuffer);
      await this.processZip(nestedZip, newZip);
    }
  }

  protected shouldInclude(path: string): boolean {
    let isNotValid = false;
    this.extensionExcludes.forEach(ext => {
      isNotValid = isNotValid || path.endsWith(ext);
    });
    this.inclusionExcludes.forEach(inc => {
      isNotValid = isNotValid || path.includes(inc);
    });
    return !isNotValid;
  }
}
