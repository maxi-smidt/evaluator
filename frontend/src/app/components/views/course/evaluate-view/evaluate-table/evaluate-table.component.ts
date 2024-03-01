import {Component, EventEmitter, input, Output} from '@angular/core';
import {Entry} from "../../../../../interfaces/correction";

@Component({
  selector: 'ms-evaluate-table',
  templateUrl: './evaluate-table.component.html',
  styleUrls: ['./evaluate-table.component.css']
})
export class EvaluateTableComponent {
  defaultPoints = input<number>();
  tableData = input<Entry[]>();

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
