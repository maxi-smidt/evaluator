import {AfterViewChecked, Component, Input, OnInit} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Entry} from "../../../../../interfaces/correction";

@Component({
  selector: 'app-evaluate-table',
  templateUrl: './evaluate-table.component.html',
  styleUrls: ['./evaluate-table.component.css']
})
export class EvaluateTableComponent implements AfterViewChecked {
  protected displayedColumns: string[] = ['text', 'points', 'action'];
  protected dataSource;

  @Input()
  tableData: Entry[] = [];

  constructor() {
    this.dataSource = new MatTableDataSource(this.tableData);
  }

  ngAfterViewChecked(): void {
    this.dataSource = new MatTableDataSource(this.tableData);
  }

  protected deleteRow(index: number) {
    this.tableData.splice(index, 1);
    this.dataSource = new MatTableDataSource(this.tableData);
  }

  protected addRow() {
    this.tableData.push({text: '', points: 0});
    this.dataSource = new MatTableDataSource(this.tableData);
  }
}
