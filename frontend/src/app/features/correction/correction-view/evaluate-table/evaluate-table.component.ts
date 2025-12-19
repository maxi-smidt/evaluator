import { Component, EventEmitter, input, Output } from '@angular/core';
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
  defaultPoints = input.required<number>();
  tableData = input.required<Entry[]>();
  readOnly = input.required<boolean>();
  pointStepSize = input.required<number>();
  showDeduction = input.required<boolean>();
  previousDeductions = input<Deduction[] | undefined>();

  @Output()
  totalPoints = new EventEmitter<number>();

  currentPoints: number = 0;

  protected deleteRow(index: number) {
    this.tableData().splice(index, 1);
    this.updatePointsAndEmit();
  }

  protected addRow() {
    this.tableData().push({ text: '', points: 0 });
  }

  protected onInputChange() {
    this.updatePointsAndEmit();
  }

  private updatePointsAndEmit() {
    this.currentPoints =
      this.defaultPoints() +
      this.tableData().reduce((acc, entry) => acc + entry.points, 0);
    this.totalPoints.emit(this.currentPoints);
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
      (entry) => entry.text === stripHtml(description), // the entry.text is rendered as pdf because of the editor
    );
  }

  addPreviousDeduction(deduction: Deduction) {
    const points: number = Number.parseFloat(deduction.deduction);
    this.tableData().push({
      text: deduction.description,
      points: Number.isNaN(points) ? 0 : points,
    });
    this.updatePointsAndEmit();
  }
}
