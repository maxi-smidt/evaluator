import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ReportService } from './services/report.service';
import { ToastService } from '../../shared/services/toast.service';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'ms-report',
  imports: [
    DropdownModule,
    FormsModule,
    TranslatePipe,
    InputTextModule,
    ButtonModule,
    Textarea,
  ],
  templateUrl: './report.component.html',
})
export class ReportComponent {
  options: string[] = ['BUG', 'FEATURE'];
  selection: string = '';
  title: string = '';
  description: string = '';

  constructor(
    private reportService: ReportService,
    private toastService: ToastService,
  ) {}

  protected onSubmit() {
    this.reportService
      .submitReport(this.title, this.description, this.selection)
      .subscribe({
        next: () => {
          this.toastService.info('report.message');
        },
        error: () => {
          this.toastService.error('report.error');
        },
      });
    this.selection = '';
    this.title = '';
    this.description = '';
  }
}
