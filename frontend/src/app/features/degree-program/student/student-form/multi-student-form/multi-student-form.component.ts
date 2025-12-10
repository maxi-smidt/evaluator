import { Component, input, ViewChild } from '@angular/core';
import { Button } from 'primeng/button';
import {
  FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from 'primeng/fileupload';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Papa } from 'ngx-papaparse';
import { Student } from '../../../../course/models/student.model';
import {
  ClassGroup,
  SimpleClassGroup,
} from '../../../models/class-group.model';
import { ConfirmationService } from '../../../../../shared/services/confirmation.service';
import { NgClass } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../services/student.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'ms-multi-student-form',
  imports: [
    Button,
    FileUploadModule,
    TranslatePipe,
    TableModule,
    TooltipModule,
    ConfirmDialogModule,
    NgClass,
    SelectModule,
    FormsModule,
  ],
  templateUrl: './multi-student-form.component.html',
  styles: [
    `
      .bg-transparent-danger {
        background-color: rgba(255, 0, 0, 0.5);
      }
    `,
  ],
})
export class MultiStudentFormComponent {
  classGroups = input.required<ClassGroup[]>();
  @ViewChild('fileUpload', { static: false }) fileUpload!: FileUpload;
  expectedHeader = JSON.stringify(['MatNr', 'Name', 'Vorname']);
  students: Student[] = [];
  errorStudents: string[] = [];
  selectedClassGroup: SimpleClassGroup | undefined;

  constructor(
    private papa: Papa,
    private confirmationService: ConfirmationService,
    private studentService: StudentService,
    private toastService: ToastService,
  ) {}

  removeStudentFromSelection(studentId: string) {
    this.confirmationService
      .makeConfirmDialog(
        'common.confirmation.header',
        'degree-program.class-groups-view.confirmation-message',
        'common.confirmation.accept',
        'common.confirmation.reject',
      )
      .then((save) => {
        if (save) {
          this.students = this.students.filter(
            (student) => student.id !== studentId,
          );
          this.errorStudents = this.errorStudents.filter(
            (id) => id !== studentId,
          );
        }
      });
  }

  clearStudents() {
    this.fileUpload.clear();
    this.errorStudents = [];
    this.students = [];
  }

  isInErrorList(studentId: string) {
    return this.errorStudents.indexOf(studentId) > -1;
  }

  onSelect(event: FileSelectEvent) {
    if (!this.selectedClassGroup) {
      return;
    }

    const file = event.files[0];
    this.papa.parse(file, {
      header: true,
      complete: (results) => {
        if (JSON.stringify(results.meta.fields) === this.expectedHeader) {
          this.parseStudents(results.data);
        } else {
          this.toastService.error('degree-program.students-view.header-error');
          this.fileUpload.clear();
        }
      },
      error: () => {
        this.toastService.error('degree-program.students-view.parse-error');
        this.fileUpload.clear();
      },
    });
  }

  parseStudents(data: { MatNr: string; Name: string; Vorname: string }[]) {
    data.forEach((s) => {
      this.students.push({
        firstName: s.Vorname,
        lastName: s.Name,
        id: s.MatNr.startsWith('S') ? s.MatNr : `S${s.MatNr}`,
        startYear: this.selectedClassGroup!.startYear,
      });
    });
  }

  onSubmit() {
    const students = this.students.map((s) => ({
      ...s,
      classGroup: this.selectedClassGroup!.id,
    }));

    this.studentService.createStudents(students).subscribe({
      next: () => {
        this.toastService.success('common.saved');
        this.fileUpload.clear();
        this.students = [];
        this.errorStudents = [];
      },
      error: (err) => {
        this.toastService.error('degree-program.students-view.students-error');
        (err as HttpErrorResponse).error.forEach(
          (obj: object, index: number) => {
            if (Object.keys(obj).length !== 0) {
              this.errorStudents.push(this.students[index].id);
            }
          },
        );
      },
    });
  }
}
