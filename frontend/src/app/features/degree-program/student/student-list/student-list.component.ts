import { Component, OnInit } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { StudentService } from '../../services/student.service';
import { Student } from '../../../course/models/student.model';
import { UrlParamService } from '../../../../shared/services/url-param.service';
import { ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'ms-student-list',
  standalone: true,
  imports: [
    TranslatePipe,
    Button,
    CheckboxModule,
    DropdownModule,
    PrimeTemplate,
    TableModule,
  ],
  templateUrl: './student-list.component.html',
})
export class StudentListComponent implements OnInit {
  protected students: Student[] = [];

  constructor(
    private studentService: StudentService,
    private urlParamService: UrlParamService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const degreeProgramAbbreviation = this.urlParamService.findParam(
      'abbreviation',
      this.route,
    );
    this.studentService.getStudents(degreeProgramAbbreviation).subscribe({
      next: (value) => {
        this.students = value;
      },
    });
  }
}
