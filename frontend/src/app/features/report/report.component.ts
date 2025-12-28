import {
  Component,
  computed,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { SelectModule } from 'primeng/select';
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
    SelectModule,
    FormsModule,
    TranslatePipe,
    InputTextModule,
    ButtonModule,
    Textarea,
  ],
  templateUrl: './report.component.html',
})
export class ReportComponent {
  private reportService = inject(ReportService);
  private toastService = inject(ToastService);

  options: string[] = ['BUG', 'FEATURE'];

  selection: WritableSignal<string | null> = signal<string | null>(null);
  title: WritableSignal<string> = signal('');
  description: WritableSignal<string> = signal('');

  isValid = computed(() => {
    return (
      this.selection() &&
      this.title().trim().length > 0 &&
      this.description().trim().length > 0
    );
  });

  protected onSubmit() {
    this.reportService
      .submitReport(this.title(), this.description(), this.selection()!)
      .subscribe({
        next: () => {
          this.toastService.info('report.message');
        },
        error: () => {
          this.toastService.error('report.error');
        },
      });
    this.selection.set(null);
    this.title.set('');
    this.description.set('');
  }
}
