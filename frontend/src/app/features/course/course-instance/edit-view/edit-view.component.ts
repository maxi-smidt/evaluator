import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ConfirmationService, MenuItem, MessageService} from 'primeng/api';
import {Student} from "../../models/student.model";
import {EditPartition} from "../../models/edit-partition.model";
import {CourseService} from "../../services/course.service";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {EditGroupComponent} from "./edit-group/edit-group.component";
import {EditPartitionComponent} from "./edit-partition/edit-partition.component";
import {TranslatePipe} from "../../../../shared/pipes/translate.pipe";
import {TranslationService} from "../../../../shared/services/translation.service";
import {TabMenuModule} from "primeng/tabmenu";
import {EditGeneralComponent} from "./edit-general/edit-general.component";
import {CourseInstance, DueDateCourseInstance, SerializerType} from "../../models/course.model";
import {AssignmentService} from "../../../assignment/services/assignment.service";
import {UrlParamService} from "../../../../shared/services/url-param.service";
import {UserService} from "../../../../core/services/user.service";
import {User} from "../../../../core/models/user.models";
import {EditStaffComponent} from "./edit-staff/edit-staff.component";
import {EditDueDatesComponent} from "./edit-due-dates/edit-due-dates.component";

@Component({
  selector: 'ms-edit-view',
  templateUrl: './edit-view.component.html',
  standalone: true,
  imports: [
    ConfirmDialogModule,
    EditGroupComponent,
    EditPartitionComponent,
    TranslatePipe,
    TabMenuModule,
    EditGeneralComponent,
    EditStaffComponent,
    EditDueDatesComponent
  ]
})
export class EditViewComponent implements OnInit {
  user: User = {} as User;

  menuItems: MenuItem[];
  activeItem: MenuItem | undefined;

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
  dueDateCourseInstanceBefore: DueDateCourseInstance = {} as DueDateCourseInstance;

  // staff (should only be queried when role is higher than tutor)
  selectedCourseLeaders: User[] = [];
  selectedCourseLeadersBefore: User[] = [];
  selectedTutors: User[] = [];
  selectedTutorsBefore: User[] = [];

  constructor(private courseService: CourseService,
              private route: ActivatedRoute,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,
              private translationService: TranslationService,
              private assignmentService: AssignmentService,
              private urlParamService: UrlParamService,
              private userService: UserService) {
    this.menuItems = [
      {label: this.translationService.translate('edit.title-students')},
      {label: this.translationService.translate('edit.title-partition')},
      {label: this.translationService.translate('edit.title-general')},
      {label: this.translationService.translate('edit.title-assignments')}
    ];

    this.activeItem = this.menuItems[3];
  }

  ngOnInit() {
    this.courseId = this.urlParamService.findParam('courseId', this.route);

    this.userService.getUser().subscribe({
      next: value => {
        this.user = value;
        if (value.role !== 'DEGREE_PROGRAM_DIRECTOR' && value.role !== 'COURSE_LEADER') {
          return;
        }
        this.menuItems.push({label: this.translationService.translate('edit.title-staff')});
        this.activeItem = this.menuItems[3]

        this.userService.getUsers([`course=${this.courseId}`]).subscribe({
          next: value => {
            this.pushUsersSeparated(value);
            this.selectedTutorsBefore = JSON.parse(JSON.stringify(this.selectedTutors));
            this.selectedCourseLeadersBefore = JSON.parse(JSON.stringify(this.selectedCourseLeaders));
          }
        });
      }
    });

    // grouped students
    this.courseService.getStudentsInGroupsByCourse(this.courseId).subscribe({
      next: students => {
        this.groupedStudents = students.groupedStudents;
        this.adjustInactiveGroup();
        this.groupedStudentsBefore = JSON.parse(JSON.stringify(students.groupedStudents));
      }
    });

    // group partition
    this.assignmentService.getTutorAssignmentPartition(this.courseId).subscribe({
      next: partition => {
        this.partition = partition.partition;
        this.partitionBefore = JSON.parse(JSON.stringify(partition.partition));
        this.groups = partition.groups;
      }
    });

    // general
    this.courseService.getCourseInstance<CourseInstance>(this.courseId, SerializerType.NORMAL).subscribe({
      next: course => {
        this.course = course;
        this.courseBefore = JSON.parse(JSON.stringify(course));
      }
    });

    // due dates
    this.courseService.getCourseInstance<DueDateCourseInstance>(this.courseId, SerializerType.DUE_DATE).subscribe({
      next: value => {
        this.dueDateCourseInstance = value;
        this.dueDateCourseInstance.assignments = value.assignments.map(assignment => {
          return {
            ...assignment,
            dueTo: new Date(assignment.dueTo) // iso string has to be instantiated as date
          };
        });
        this.dueDateCourseInstanceBefore = JSON.parse(JSON.stringify(this.dueDateCourseInstance));
      }
    })
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }

  adjustInactiveGroup() {
    if (!('-1' in this.groupedStudents)) {
      this.groupedStudents['-1'] = [];
    }
  }

  private hasChanged() {
    return this.groupHasChanged()
      || this.partitionHasChanged()
      || this.courseHasChanged()
      || this.staffHasChanged()
      || this.dueDatesHaveChanged();
  }

  private groupHasChanged() {
    return JSON.stringify(this.groupedStudents) !== JSON.stringify(this.groupedStudentsBefore);
  }

  private partitionHasChanged() {
    return JSON.stringify(this.partition) !== JSON.stringify(this.partitionBefore);
  }

  private courseHasChanged() {
    return JSON.stringify(this.course) !== JSON.stringify(this.courseBefore);
  }

  private staffHasChanged() {
    return JSON.stringify(this.selectedTutors) !== JSON.stringify(this.selectedTutorsBefore) ||
      JSON.stringify(this.selectedCourseLeaders) !== JSON.stringify(this.selectedCourseLeadersBefore);
  }

  private dueDatesHaveChanged() {
    return JSON.stringify(this.dueDateCourseInstance) !== JSON.stringify(this.dueDateCourseInstanceBefore);
  }

  checkChanges() {
    if (!this.hasChanged()) {
      return true;
    }
    return this.confirmDialog().then(
      result => {
        return result;
      }
    )
  }

  private confirmDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: this.translationService.translate('common.confirmDialog.message'),
        header: this.translationService.translate('common.confirmDialog.header'),
        icon: 'pi pi-exclamation-triangle',
        acceptIcon: "none",
        rejectIcon: "none",
        rejectButtonStyleClass: "p-button-text",
        accept: () => {
          resolve(true);
        },
        reject: () => {
          resolve(false);
        }
      });
    });
  }

  onSaveBtnClick() {
    if (!this.hasChanged()) {
      this.showInfoMessage('common.noChangesInfo');
      return;
    }

    if (this.groupHasChanged()) {
      this.courseService.patchStudentsCourseGroup(this.courseId, this.groupedStudents).subscribe({
        next: groupedStudents => {
          this.groupedStudents = groupedStudents.groupedStudents;
          this.groupedStudentsBefore = JSON.parse(JSON.stringify(this.groupedStudents));
          this.showInfoMessage('common.saved');
        }
      });
    }

    if (this.partitionHasChanged()) {
      this.assignmentService.putAssignmentPartition(this.courseId, this.partition).subscribe({
        next: partition => {
          this.partition = partition.partition;
          this.partitionBefore = JSON.parse(JSON.stringify(partition.partition));
          this.groups = partition.groups;
          this.showInfoMessage('common.saved');
        }
      });
    }

    if (this.courseHasChanged()) {
      this.courseService.patchCourseInstance<CourseInstance>(this.courseId, SerializerType.NORMAL, {
        allowLateSubmission: this.course.allowLateSubmission,
        lateSubmissionPenalty: this.course.lateSubmissionPenalty,
        pointStepSize: this.course.pointStepSize
      }).subscribe({
        next: course => {
          this.course = course;
          this.courseBefore = JSON.parse(JSON.stringify(course));
          this.showInfoMessage('common.saved');
        }
      });
    }

    if (this.staffHasChanged()) {
      const patch = {
        courseLeaders: this.selectedCourseLeaders.map(user => user.username),
        tutors: this.selectedTutors.map(user => user.username)
      };
      this.courseService.patchCourseInstance(this.courseId, SerializerType.STAFF, patch).subscribe({
        next: () => {
          this.selectedTutorsBefore = JSON.parse(JSON.stringify(this.selectedTutors));
          this.selectedCourseLeaders = JSON.parse(JSON.stringify(this.selectedCourseLeaders));
          this.showInfoMessage('common.saved');
        }
      });
    }

    if (this.dueDatesHaveChanged()) {
      const patch = {
        ...this.dueDateCourseInstance,
        assignments: this.dueDateCourseInstance.assignments.map(assignment => {
          return {
            ...assignment,
            dueTo: assignment.dueTo.toISOString() // iso string has to be instantiated as date
          };
        })
      }
      this.courseService.patchCourseInstance(this.courseId, SerializerType.DUE_DATE, patch).subscribe({
        next: () => {
          this.dueDateCourseInstanceBefore = JSON.parse(JSON.stringify(this.dueDateCourseInstance));
          this.showInfoMessage('common.saved');
        }
      });
    }
  }

  showInfoMessage(key: string) {
    const text = this.translationService.translate(key);
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: text
    });
  }

  pushUsersSeparated(users: User[]) {
    users.forEach(user => {
      if (user.role === 'TUTOR') {
        this.selectedTutors.push(user);
      } else if (user.role === 'COURSE_LEADER') {
        this.selectedCourseLeaders.push(user);
      }
    });
  }
}
