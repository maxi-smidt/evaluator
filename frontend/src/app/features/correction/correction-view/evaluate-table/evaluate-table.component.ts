import { Component, computed, input, model } from '@angular/core';
import { Entry } from '../../models/correction.model';
import { EditorModule } from 'primeng/editor';
import { InputNumber } from 'primeng/inputnumber';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Deduction } from '../../../previous-deductions/models/previous-deduction.model';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ms-evaluate-table',
  templateUrl: './evaluate-table.component.html',
  styleUrls: ['./evaluate-table.component.css'],
  imports: [
    EditorModule,
    InputNumber,
    TranslatePipe,
    ButtonModule,
    FormsModule,
    InputTextModule,
    TableModule,
    TagModule,
    TooltipModule,
    NgClass,
  ],
})
export class EvaluateTableComponent {
  public readonly maxPossiblePoints = input<number>(0);
  public readonly tableData = model.required<Entry[]>();
  public readonly readOnly = input.required<boolean>();
  public readonly pointStepSize = input.required<number>();

  protected readonly currentPoints = computed(() =>
    this.tableData().reduce(
      (acc, current) => acc + current.points,
      this.maxPossiblePoints(),
    ),
  );

  showDeduction = input.required<boolean>();
  previousDeductions = input<Deduction[] | undefined>();

  protected deleteRow(index: number) {
    this.tableData.update((current) => current.filter((_, i) => index !== i));
  }

  protected addRow() {
    this.addDeduction({ text: '', points: 0 });
  }

  protected updateEntry(
    index: number,
    field: keyof Entry,
    value: number | string,
  ) {
    this.tableData.update((current) => {
      const newArr = [...current];
      newArr[index] = { ...newArr[index], [field]: value };
      return newArr;
    });
  }

  protected showDeductionTableExtension(): boolean {
    const len = this.previousDeductions()?.length;
    return len !== undefined && len > 0 && this.showDeduction();
  }

  protected tableHasDeduction(description: string): boolean {
    const stripHtml = (text: string): string => {
      return text.replace(/<[^>]*>/g, '').trim();
    };
    return this.tableData().some(
      (entry) => stripHtml(entry.text) === this.escapeText(description),
    );
  }

  protected addPreviousDeduction(deduction: Deduction) {
    const points: number = Number.parseFloat(deduction.deduction);
    this.addDeduction({
      text: `<p>${this.escapeText(deduction.description)}</p>`,
      points: Number.isNaN(points) ? 0 : points,
    });
  }

  private addDeduction(deduction: Entry) {
    this.tableData.update((current) => [...current, deduction]);
  }

  private escapeText(text: string) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/ /g, '&nbsp;')
      .replace(/\n/g, '<br>');
  }
}
