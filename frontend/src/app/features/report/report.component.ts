import {Component} from '@angular/core';
import {MessageService} from "primeng/api";
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";
import {TranslatePipe} from "../../shared/pipes/translate.pipe";
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";
import {ButtonModule} from "primeng/button";
import {ReportService} from "./services/report.service";
import {TranslationService} from "../../shared/services/translation.service";

@Component({
  selector: 'ms-report',
  standalone: true,
  imports: [
    DropdownModule,
    FormsModule,
    TranslatePipe,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
  ],
  templateUrl: './report.component.html'
})
export class ReportComponent {
  options: string[] = ['BUG', 'FEATURE'];
  selection: string = '';
  title: string = '';
  description: string = '';

  constructor(private messageService: MessageService,
              private reportService: ReportService,
              private translationService: TranslationService) {
  }

  protected onSubmit() {
    this.reportService.submitReport(this.title, this.description, this.selection).subscribe(
      (next) => {
        this.messageService.add({
          severity: 'info',
          summary: 'Info',
          detail: this.translationService.translate('report.message')
        });
      }
    );
    this.selection = '';
    this.title = '';
    this.description = '';
  }
}
