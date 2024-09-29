import { Component, model } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { FormsModule } from '@angular/forms';
import { Student } from '../../../models/student.model';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'ms-edit-students',
  standalone: true,
  imports: [DropdownModule, TranslatePipe, FormsModule, Button, TableModule],
  templateUrl: './edit-students.component.html',
})
export class EditStudentsComponent {
  students = model.required<Student[]>();

  protected onRemoveClick(student: Student) {
    this.students.set(this.students().filter((s) => s.id !== student.id));
  }
}
