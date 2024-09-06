import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { ReportService } from './services/report.service';
import { ToastService } from '../../shared/services/toast.service';

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
      .subscribe(() => {
        this.toastService.info('report.message');
      });
    this.selection = '';
    this.title = '';
    this.description = '';
  }
}
