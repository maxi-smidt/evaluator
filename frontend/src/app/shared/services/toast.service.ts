import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly ERROR = 'Error';
  private readonly INFO = 'Info';
  private readonly SUCCESS = 'Success';

  constructor(
    private messageService: MessageService,
    private translationService: TranslationService,
  ) {}

  error(key: string) {
    this.showMessage(this.ERROR, key);
  }

  success(key: string) {
    this.showMessage(this.SUCCESS, key);
  }

  info(key: string) {
    this.showMessage(this.INFO, key);
  }

  private showMessage(summary: string, key: string) {
    this.messageService.add({
      severity: summary.toLowerCase(),
      summary: summary,
      detail: this.translationService.translate(key),
    });
  }
}
