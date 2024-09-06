import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(
    private messageService: MessageService,
    private translationService: TranslationService,
  ) {}

  error(key: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: this.translationService.translate(key),
    });
  }

  success(key: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: this.translationService.translate(key),
    });
  }

  info(key: string) {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: this.translationService.translate(key),
    });
  }
}
