import {Component, EventEmitter, input, Output} from '@angular/core';
import {Entry} from "../../models/correction.model";
import {EditorModule} from "primeng/editor";
import {InputNumberModule} from "primeng/inputnumber";
import {TranslatePipe} from "../../../../shared/pipes/translate.pipe";
import {ButtonModule} from "primeng/button";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'ms-evaluate-table',
  templateUrl: './evaluate-table.component.html',
  styleUrls: ['./evaluate-table.component.css'],
  standalone: true,
  imports: [
    EditorModule,
    InputNumberModule,
    TranslatePipe,
    ButtonModule,
    FormsModule
  ]
})
export class EvaluateTableComponent {
  defaultPoints = input.required<number>();
  tableData = input.required<Entry[]>();
  readOnly = input.required<boolean>();

  @Output()
  totalPoints = new EventEmitter<number>();

  currentPoints: number = 0;

  protected deleteRow(index: number) {
    this.tableData()!.splice(index, 1);
  }

  protected addRow() {
    this.tableData()!.push({text: '', points: 0});
  }

  protected onInputChange() {
    this.currentPoints = this.defaultPoints()! + this.tableData()!.reduce((acc, entry) => acc + entry.points, 0);
    this.totalPoints.emit(this.currentPoints);
  }
}
