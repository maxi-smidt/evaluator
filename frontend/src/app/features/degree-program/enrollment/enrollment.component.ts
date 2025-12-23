import { Component, inject } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Course, CourseInstance } from '../../course/models/course.model';
import { CourseService } from '../../course/services/course.service';
import { ActivatedRoute } from '@angular/router';
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
import { map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-enrollment',
  imports: [
    SelectModule,
    TranslatePipe,
    FormsModule,
    MultiSelectModule,
    Button,
    TableModule,
    InputTextModule,
  ],
  templateUrl: './enrollment.component.html',
})
export class EnrollmentComponent {
  private readonly courseService = inject(CourseService);
  private readonly route = inject(ActivatedRoute);
  private readonly degreeProgramService = inject(DegreeProgramService);
  private readonly studentService = inject(StudentService);
  private readonly toastService = inject(ToastService);

  private readonly degreeProgramAbbreviation$ = this.route.params.pipe(
    map((params) => params['abbreviation']),
  );
  protected readonly courseInstances = toSignal(
    this.degreeProgramAbbreviation$.pipe(
      switchMap((abbreviation) =>
        this.courseService.getCourseInstances(abbreviation),
      ),
    ),
  );
  protected classGroups = toSignal(
    this.degreeProgramAbbreviation$.pipe(
      switchMap((abbreviation) =>
        this.degreeProgramService.getClassGroups(abbreviation),
      ),
    ),
  );

  protected students: Student[] = [];
  protected selectedCourseInstance?: Course;
  protected selectedClassGroups: ClassGroup[] = [];
  protected selectedStudent?: string;

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
