import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import {
  Course,
  CourseInstance,
  SimpleCourseInstance,
} from '../../course/models/course.model';
import { CourseService } from '../../course/services/course.service';
import { ActivatedRoute } from '@angular/router';
import { UrlParamService } from '../../../shared/services/url-param.service';
import { FormsModule } from '@angular/forms';
import { DegreeProgramService } from '../services/degree-program.service';
import { ClassGroup } from '../models/class-group.model';
import { MultiSelectModule } from 'primeng/multiselect';
import { Button } from 'primeng/button';
import { Student } from '../../course/models/student.model';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { StudentService } from '../services/student.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
    selector: 'ms-enrollment',
    imports: [
        DropdownModule,
        TranslatePipe,
        FormsModule,
        MultiSelectModule,
        Button,
        TableModule,
        InputTextModule,
    ],
    templateUrl: './enrollment.component.html'
})
export class EnrollmentComponent implements OnInit {
  courseInstances: SimpleCourseInstance[] = [];
  selectedCourseInstance: Course | undefined;

  classGroups: ClassGroup[] = [];
  selectedClassGroups: ClassGroup[] = [];

  selectedStudent: string | undefined;

  students: Student[] = [];

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private urlParamService: UrlParamService,
    private degreeProgramService: DegreeProgramService,
    private studentService: StudentService,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    const degreeProgramAbbreviation = this.urlParamService.findParam(
      'abbreviation',
      this.route,
    );

    this.courseService.getCourseInstances(degreeProgramAbbreviation).subscribe({
      next: (value) => {
        this.courseInstances = value;
      },
    });

    this.degreeProgramService
      .getClassGroups(degreeProgramAbbreviation)
      .subscribe({
        next: (value) => {
          this.classGroups = value;
        },
      });
  }

  protected buildCourseInstanceLabel(courseInstance: CourseInstance) {
    return `${courseInstance.course.abbreviation} ${courseInstance.year}`;
  }

  protected onLoadStudentsClick() {
    const classGroupIds = this.selectedClassGroups.map((prev) => prev.id);
    this.studentService.getStudents('ids', classGroupIds.join(',')).subscribe({
      next: (value) => {
        this.students = this.students.concat(
          value.filter(
            (student) =>
              this.students.findIndex(
                (element) => element.id === student.id,
              ) === -1,
          ),
        );
      },
    });
  }

  protected onLoadStudentClick() {
    this.studentService.getStudent(this.selectedStudent!).subscribe({
      next: (value) => {
        const index = this.students.findIndex(
          (element) => element.id === value.id,
        );
        if (index === -1) {
          this.students.push(value);
          this.selectedStudent = undefined;
        } else {
          this.toastService.info(
            'degree-program.enrollment-view.error-student-exists',
          );
        }
      },
      error: () => {
        this.toastService.error(
          'degree-program.enrollment-view.error-student-untraceable',
        );
      },
    });
  }

  protected onRemoveClick(student: Student) {
    const index = this.students.indexOf(student);

    if (index > -1) {
      this.students.splice(index, 1);
    }
  }

  protected onEnrollStudentsClick() {
    this.degreeProgramService
      .enrollStudents(this.selectedCourseInstance!.id, this.students)
      .subscribe({
        next: () => {
          this.toastService.success('common.saved');
          this.students = [];
        },
        error: () => {
          this.toastService.error(
            'degree-program.enrollment-view.error-enrollment',
          );
        },
      });
  }
}
