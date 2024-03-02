import {inject, Pipe, PipeTransform} from '@angular/core';
import {TranslationService} from "../services/translation.service";

@Pipe({
  name: 'translate',
  standalone: true
})
export class TranslatePipe implements PipeTransform {
  translationService: TranslationService = inject(TranslationService);

  transform(value: string): string {
    return this.translationService.translate(value);
  }

}
