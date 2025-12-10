import { Component, OnInit } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { DegreeProgramService } from '../../services/degree-program.service';
import { ClassGroup, DetailClassGroup } from '../../models/class-group.model';
import { UrlParamService } from '../../../../shared/services/url-param.service';
import { ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { StudentService } from '../../services/student.service';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';

@Component({
    selector: 'ms-class-group-detail',
    imports: [
        TranslatePipe,
        Button,
        PrimeTemplate,
        TableModule,
        DialogModule,
        ConfirmDialogModule,
        TooltipModule,
    ],
    templateUrl: './class-group-detail.component.html'
})
export class ClassGroupDetailComponent implements OnInit {
  classGroup: DetailClassGroup | undefined;
  modalVisibility: boolean = false;
  selectedStudentId: string | undefined;
  classGroups: ClassGroup[] = [];

  constructor(
    private degreeProgramService: DegreeProgramService,
    private route: ActivatedRoute,
    private urlParamService: UrlParamService,
    private confirmationService: ConfirmationService,
    private studentService: StudentService,
  ) {}

  ngOnInit() {
    const classGroupId = this.urlParamService.findParam(
      'classGroupId',
      this.route,
    );
    const degreeProgramAbbreviation = this.urlParamService.findParam(
      'abbreviation',
      this.route,
    );

    this.degreeProgramService.getClassGroup(classGroupId).subscribe({
      next: (value) => {
        this.classGroup = value;
      },
    });

    this.degreeProgramService
      .getClassGroups(degreeProgramAbbreviation)
      .subscribe({
        next: (value) => {
          this.classGroups = value.filter(
            (classGroup) => classGroup.id !== Number(classGroupId),
          );
        },
      });
  }

  removeStudentFromClass(studentId: string) {
    this.confirmationService
      .makeConfirmDialog(
        'common.confirmation.header',
        'degree-program.class-groups-view.confirmation-message',
        'common.confirmation.accept',
        'common.confirmation.reject',
      )
      .then((save) => {
        if (save) {
          this.studentService.removeFromClassGroup(studentId).subscribe({
            next: () => {
              if (this.classGroup) {
                this.classGroup.students = this.classGroup.students.filter(
                  (student) => student.id !== studentId,
                );
              }
            },
          });
        }
      });
  }

  setSelectedStudent(studentId: string) {
    this.selectedStudentId = studentId;
    this.modalVisibility = true;
  }

  setSelectedClassGroup(classGroupId: number) {
    this.modalVisibility = false;
    this.changeStudentsClassGroup(this.selectedStudentId!, classGroupId);
    this.selectedStudentId = undefined;
  }

  changeStudentsClassGroup(studentId: string, classGroupId: number) {
    this.studentService.changeClassGroup(studentId, classGroupId).subscribe({
      next: (value) => {
        if (this.classGroup && value.id !== this.classGroup.id) {
          this.classGroup.students = this.classGroup.students.filter(
            (student) => student.id !== studentId,
          );
        }
      },
    });
  }
}
