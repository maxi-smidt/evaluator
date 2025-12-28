import { inject, Injectable } from '@angular/core';
import { ConfirmationService as CS } from 'primeng/api';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private confirmationService = inject(CS);
  private translationService = inject(TranslationService);

  public makeConfirmDialog(
    headerKey: string,
    messageKey: string,
    acceptLabel: string,
    rejectLabel: string,
  ) {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: this.translationService.translate(messageKey),
        acceptLabel: this.translationService.translate(acceptLabel),
        rejectLabel: this.translationService.translate(rejectLabel),
        header: this.translationService.translate(headerKey),
        icon: 'pi pi-exclamation-triangle',
        rejectButtonStyleClass: 'p-button-text',
        accept: () => {
          resolve(true);
        },
        reject: () => {
          resolve(false);
        },
      });
    });
  }
}
