import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Student } from '../../models/student.model';
import { EditPartition } from '../../models/edit-partition.model';
import { CourseService } from '../../services/course.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SettingGroupComponent } from './setting-group/setting-group.component';
import { SettingPartitionComponent } from './setting-partition/setting-partition.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';
import { SettingGeneralComponent } from './setting-general/setting-general.component';
import {
  CourseInstance,
  DueDateCourseInstance,
  SerializerType,
} from '../../models/course.model';
import { AssignmentService } from '../../../assignment/services/assignment.service';
import { UrlParamService } from '../../../../shared/services/url-param.service';
import { UserService } from '../../../../core/services/user.service';
import { Role, User } from '../../../../core/models/user.models';
import { SettingStaffComponent } from './setting-staff/setting-staff.component';
import { SettingDueDatesComponent } from './setting-due-dates/setting-due-dates.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { SettingStudentsComponent } from './setting-students/setting-students.component';
import { StudentService } from '../../../degree-program/services/student.service';
import { DegreeProgramService } from '../../../degree-program/services/degree-program.service';
import { Button } from 'primeng/button';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

@Component({
  selector: 'ms-edit-view',
  templateUrl: './settings-view.component.html',
  imports: [
    ConfirmDialogModule,
    SettingGroupComponent,
    SettingPartitionComponent,
    TranslatePipe,
    SettingGeneralComponent,
    SettingStaffComponent,
    SettingDueDatesComponent,
    SettingStudentsComponent,
    Button,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
  ],
})
export class SettingsViewComponent implements OnInit {
  user: User = {} as User;
  activeTab: string = '0';

  // grouped students
  courseId: number = -1;
  groupedStudents: { [groupNr: string]: Student[] } = {};
  groupedStudentsBefore: { [groupNr: string]: Student[] } = {};

  // group partition
  partition: EditPartition[] = [];
  partitionBefore: EditPartition[] = [];
  groups: number[] = [];

  // general
  course: CourseInstance = {} as CourseInstance;
  courseBefore: CourseInstance = {} as CourseInstance;

  // due dates
  dueDateCourseInstance: DueDateCourseInstance = {} as DueDateCourseInstance;
  dueDateCourseInstanceBefore: DueDateCourseInstance =
    {} as DueDateCourseInstance;

  // staff (should only be queried when role is higher than tutor)
  selectedCourseLeaders: User[] = [];
  selectedCourseLeadersBefore: User[] = [];
  selectedTutors: User[] = [];
  selectedTutorsBefore: User[] = [];
  students: Student[] = [];
  studentsBefore: Student[] = [];

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private translationService: TranslationService,
    private assignmentService: AssignmentService,
    private urlParamService: UrlParamService,
    private userService: UserService,
    private toastService: ToastService,
    private studentService: StudentService,
    private degreeProgramService: DegreeProgramService,
  ) {}

  ngOnInit() {
    this.courseId = this.urlParamService.findParam('courseId', this.route);

    this.userService.getUser().subscribe({
      next: (value) => {
        this.user = value;

        if (
          [Role.DEGREE_PROGRAM_DIRECTOR, Role.COURSE_LEADER].includes(
            value.role,
          )
        ) {
          this.userService.getUsers([`course=${this.courseId}`]).subscribe({
            next: (value) => {
              this.pushUsersSeparated(value);
              this.selectedTutorsBefore = JSON.parse(
                JSON.stringify(this.selectedTutors),
              );
              this.selectedCourseLeadersBefore = JSON.parse(
                JSON.stringify(this.selectedCourseLeaders),
              );
            },
          });

          this.studentService
            .getStudents('course_instance_id', this.courseId)
            .subscribe({
              next: (value) => {
                this.students = value;
                this.studentsBefore = JSON.parse(JSON.stringify(this.students));
              },
            });
        }
      },
    });

    // grouped students
    this.courseService.getStudentsInGroupsByCourse(this.courseId).subscribe({
      next: (students) => {
        this.groupedStudents = students.groupedStudents;
        this.adjustInactiveGroup();
        this.groupedStudentsBefore = JSON.parse(
          JSON.stringify(students.groupedStudents),
        );
      },
    });

    // group partition
    this.assignmentService
      .getTutorAssignmentPartition(this.courseId)
      .subscribe({
        next: (partition) => {
          this.partition = partition.partition;
          this.partitionBefore = JSON.parse(
            JSON.stringify(partition.partition),
          );
          this.groups = partition.groups;
        },
      });

    // general
    this.courseService
      .getCourseInstance<CourseInstance>(this.courseId, SerializerType.NORMAL)
      .subscribe({
        next: (course) => {
          this.course = course;
          this.courseBefore = JSON.parse(JSON.stringify(course));
        },
      });

    // due dates
    this.courseService
      .getCourseInstance<DueDateCourseInstance>(
        this.courseId,
        SerializerType.DUE_DATE,
      )
      .subscribe({
        next: (value) => {
          this.dueDateCourseInstance = value;
          this.dueDateCourseInstance.assignments = value.assignments.map(
            (assignment) => {
              return {
                ...assignment,
                dueTo: new Date(assignment.dueTo), // iso string has to be instantiated as date
              };
            },
          );
          this.dueDateCourseInstanceBefore = JSON.parse(
            JSON.stringify(this.dueDateCourseInstance),
          );
        },
      });

    this.route.queryParams.subscribe((params) => {
      this.activeTab = params['tab'] || '0';
    });
  }

  protected onTabChange(newValue: string | number | undefined) {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { tab: newValue },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      })
      .then();
  }

  adjustInactiveGroup() {
    if (!('-1' in this.groupedStudents)) {
      this.groupedStudents['-1'] = [];
    }
  }

  private hasChanged() {
    return (
      this.groupHasChanged() ||
      this.partitionHasChanged() ||
      this.courseHasChanged() ||
      this.staffHasChanged() ||
      this.dueDatesHaveChanged() ||
      this.studentsHaveChanged()
    );
  }

  private groupHasChanged() {
    return (
      JSON.stringify(this.groupedStudents) !==
      JSON.stringify(this.groupedStudentsBefore)
    );
  }

  private partitionHasChanged() {
    return (
      JSON.stringify(this.partition) !== JSON.stringify(this.partitionBefore)
    );
  }

  private courseHasChanged() {
    return JSON.stringify(this.course) !== JSON.stringify(this.courseBefore);
  }

  private staffHasChanged() {
    return (
      JSON.stringify(this.selectedTutors) !==
        JSON.stringify(this.selectedTutorsBefore) ||
      JSON.stringify(this.selectedCourseLeaders) !==
        JSON.stringify(this.selectedCourseLeadersBefore)
    );
  }

  private dueDatesHaveChanged() {
    return (
      JSON.stringify(this.dueDateCourseInstance) !==
      JSON.stringify(this.dueDateCourseInstanceBefore)
    );
  }

  private studentsHaveChanged() {
    return (
      JSON.stringify(this.students) !== JSON.stringify(this.studentsBefore)
    );
  }

  checkChanges() {
    if (!this.hasChanged()) {
      return true;
    }
    return this.confirmDialog().then((result) => {
      return result;
    });
  }

  private confirmDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: this.translationService.translate(
          'common.confirmation.message-unsaved',
        ),
        header: this.translationService.translate('common.confirmation.header'),
        icon: 'pi pi-exclamation-triangle',
        rejectButtonStyleClass: 'p-button-text',
        acceptLabel: this.translationService.translate(
          'common.confirmation.accept',
        ),
        rejectLabel: this.translationService.translate(
          'common.confirmation.reject',
        ),
        accept: () => {
          resolve(true);
        },
        reject: () => {
          resolve(false);
        },
      });
    });
  }

  onSaveBtnClick() {
    if (!this.hasChanged()) {
      this.toastService.info('common.noChangesInfo');
      return;
    }

    if (this.groupHasChanged()) {
      this.courseService
        .patchStudentsCourseGroup(this.courseId, this.groupedStudents)
        .subscribe({
          next: (groupedStudents) => {
            this.groupedStudents = groupedStudents.groupedStudents;
            this.adjustInactiveGroup();
            this.groupedStudentsBefore = JSON.parse(
              JSON.stringify(this.groupedStudents),
            );
            this.toastService.info('common.saved');
          },
        });
    }

    if (this.partitionHasChanged()) {
      this.assignmentService
        .putAssignmentPartition(this.courseId, this.partition)
        .subscribe({
          next: (partition) => {
            this.partition = partition.partition;
            this.partitionBefore = JSON.parse(
              JSON.stringify(partition.partition),
            );
            this.groups = partition.groups;
            this.toastService.info('common.saved');
          },
        });
    }

    if (this.courseHasChanged()) {
      const fn = this.course.fileName.endsWith('.pdf')
        ? this.course.fileName
        : `${this.course.fileName}.pdf`;
      this.courseService
        .patchCourseInstance<CourseInstance>(
          this.courseId,
          SerializerType.NORMAL,
          {
            allowLateSubmission: this.course.allowLateSubmission,
            lateSubmissionPenalty: this.course.lateSubmissionPenalty,
            pointStepSize: this.course.pointStepSize,
            fileName: fn,
          },
        )
        .subscribe({
          next: (course) => {
            this.course = course;
            this.courseBefore = JSON.parse(JSON.stringify(course));
            this.toastService.info('common.saved');
          },
        });
    }

    if (this.staffHasChanged()) {
      const patch = {
        courseLeaders: this.selectedCourseLeaders.map((user) => user.username),
        tutors: this.selectedTutors.map((user) => user.username),
      };
      this.courseService
        .patchCourseInstance(this.courseId, SerializerType.STAFF, patch)
        .subscribe({
          next: () => {
            this.selectedTutorsBefore = JSON.parse(
              JSON.stringify(this.selectedTutors),
            );
            this.selectedCourseLeaders = JSON.parse(
              JSON.stringify(this.selectedCourseLeaders),
            );
            this.toastService.info('common.saved');
          },
        });
    }

    if (this.dueDatesHaveChanged()) {
      const patch = {
        ...this.dueDateCourseInstance,
        assignments: this.dueDateCourseInstance.assignments.map(
          (assignment) => {
            return {
              ...assignment,
              dueTo: assignment.dueTo.toISOString(), // iso string has to be instantiated as date
            };
          },
        ),
      };
      this.courseService
        .patchCourseInstance(this.courseId, SerializerType.DUE_DATE, patch)
        .subscribe({
          next: () => {
            this.dueDateCourseInstanceBefore = JSON.parse(
              JSON.stringify(this.dueDateCourseInstance),
            );
            this.toastService.info('common.saved');
          },
        });
    }

    if (this.studentsHaveChanged()) {
      const studentsToRemove = this.studentsBefore.filter(
        (student) =>
          !this.students.some(
            (currentStudent) => currentStudent.id === student.id,
          ),
      );
      studentsToRemove.forEach((student) => {
        this.degreeProgramService
          .unEnrollStudent(this.courseId, student)
          .subscribe({
            next: () => {
              this.toastService.info('common.saved');
              this.studentsBefore = JSON.parse(JSON.stringify(this.students));
            },
          });
      });
    }
  }

  pushUsersSeparated(users: User[]) {
    users.forEach((user) => {
      if (user.role === Role.TUTOR) {
        this.selectedTutors.push(user);
      } else if (user.role === Role.COURSE_LEADER) {
        this.selectedCourseLeaders.push(user);
      }
    });
  }

  protected readonly Role = Role;
}
