import { Component, ViewChild } from '@angular/core';
import {
  FileUpload,
  FileUploadHandlerEvent,
  FileUploadModule,
} from 'primeng/fileupload';
import * as JSZip from 'jszip';
import { PlagScanService } from './services/plag-scan.service';
import { MenuItem } from 'primeng/api';
import { TranslationService } from '../../shared/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { FileDownloadService } from '../../shared/services/file-download.service';
import { ToastService } from '../../shared/services/toast.service';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'ms-plag-scan',
  standalone: true,
  imports: [
    FileUploadModule,
    TranslatePipe,
    BlockUIModule,
    ProgressSpinnerModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
  ],
  templateUrl: './plag-scan.component.html',
})
export class PlagScanComponent {
  @ViewChild('fileUpload', { static: false }) fileUpload!: FileUpload;

  isLoading: boolean = false;

  languages: MenuItem[] = [];
  selectedLanguage: MenuItem | undefined;

  extensionString: string | undefined;
  validExtensions: string[] = [];

  constructor(
    private plagScanService: PlagScanService,
    protected translationService: TranslationService,
    private fileDownloadService: FileDownloadService,
    private toastService: ToastService,
  ) {
    this.languages.push({ title: 'C++', label: 'cpp' });
    this.languages.push({ title: 'Python', label: 'python3' });
    this.languages.push({ title: 'Java', label: 'java' });
    this.languages.push({ title: 'c', label: 'c' });
    this.languages.push({ title: 'C#', label: 'csharp' });
    this.languages.push({ title: 'JavaScript', label: 'javascript' });
    this.languages.push({ title: 'TypeScript', label: 'typescript' });
    this.languages.push({ title: 'R', label: 'rlang' });
    this.languages.push({ title: 'Rust', label: 'rust' });
    this.languages.push({ title: 'Kotlin', label: 'kotlin' });
    this.languages.push({ title: 'Scala', label: 'scala' });
  }

  parseExtensions() {
    if (this.extensionString) {
      const extensions = this.extensionString.split(',');
      this.validExtensions = extensions
        .map((extension) => extension.trim())
        .filter((extension) => extension.length !== 0);
    }
  }

  async onUpload(event: FileUploadHandlerEvent) {
    this.isLoading = true;

    this.parseExtensions();

    if (this.validExtensions.length === 0) {
      this.toastService.info('plag-scan.error-extension');
      this.isLoading = false;
      return;
    }

    const file = event.files[0];
    const zip = await JSZip.loadAsync(file);

    if (!zip) {
      this.toastService.info('plag-scan.error-zip');
      this.isLoading = false;
      return;
    }

    const processedFile: File = <File>await this.cleanFile(zip);

    const formData = new FormData();
    formData.append('zipfile', processedFile, processedFile.name);

    this.plagScanService
      .scanZipFile(formData, this.selectedLanguage!.label!)
      .subscribe({
        next: (value) => {
          const blob = new Blob([value.body], { type: 'application/zip' });
          window.open(
            this.translationService.translate('plag-scan.jplag-url'),
            '_blank',
          );
          this.fileDownloadService.download(
            blob,
            this.translationService.translate('plag-scan.result'),
          );
          this.toastService.info('plag-scan.success');
          this.fileUpload.clear();
        },
        error: () => {
          this.toastService.error('plag-scan.error-general');
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  async cleanFile(zip: JSZip) {
    const newZip = new JSZip();
    await this.processZip(zip, newZip);
    return await newZip.generateAsync({ type: 'blob' });
  }

  async processZip(zip: JSZip, newZip: JSZip) {
    const entries: { path: string; file: JSZip.JSZipObject }[] = [];

    zip.forEach((path, file) => {
      if (path.endsWith('.zip') && !path.includes('__MACOSX')) {
        entries.push({ path, file });
      } else if (this.shouldInclude(path)) {
        file.async('blob').then((blob) => {
          if (!path.includes('assignsubmission_file')) {
            newZip.file(path, blob);
          }
        });
      }
    });

    for (const { file } of entries) {
      const arrayBuffer = await file.async('arraybuffer');
      const nestedZip = await JSZip.loadAsync(arrayBuffer);
      await this.processZip(nestedZip, newZip);
    }
  }

  protected shouldInclude(path: string): boolean {
    let isValidExtension: boolean = false;
    for (const extension of this.validExtensions) {
      isValidExtension = isValidExtension || path.endsWith(`.${extension}`);
    }
    return isValidExtension;
  }
}
