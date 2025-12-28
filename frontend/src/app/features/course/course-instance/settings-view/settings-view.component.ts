import { Component, computed, effect, inject, signal } from '@angular/core';
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
import {
  BehaviorSubject,
  combineLatest,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

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
export class SettingsViewComponent {
  private readonly courseService = inject(CourseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translationService = inject(TranslationService);
  private readonly assignmentService = inject(AssignmentService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly studentService = inject(StudentService);
  private readonly degreeProgramService = inject(DegreeProgramService);

  private readonly courseId$ = this.route.params.pipe(
    map((params) => params['courseId']),
  );
  protected readonly courseId = toSignal(this.courseId$);
  protected readonly user = toSignal(this.userService.getUser());

  private readonly hasAdvancedAuthorization = computed(() => {
    const u = this.user();
    return (
      u && [Role.DEGREE_PROGRAM_DIRECTOR, Role.COURSE_LEADER].includes(u.role)
    );
  });

  private readonly refreshStaffUsers$ = new BehaviorSubject<void>(undefined);
  private readonly refreshGroupPartition$ = new BehaviorSubject<void>(
    undefined,
  );
  private readonly refreshCourse$ = new BehaviorSubject<void>(undefined);
  private readonly refreshDueDates$ = new BehaviorSubject<void>(undefined);
  private readonly refreshStudents$ = new BehaviorSubject<void>(undefined);

  protected staffUsers = toSignal(
    this.refreshStaffUsers$.pipe(
      switchMap(() =>
        this.hasAdvancedAuthorization()
          ? this.userService.getUsers([`course=${this.courseId()}`])
          : of([]),
      ),
    ),
    { initialValue: [] },
  );

  protected readonly serverStateCourseLeaders = computed(() =>
    this.staffUsers().filter((user) => user.role === Role.COURSE_LEADER),
  );
  protected readonly draftStateCourseLeaders = signal<User[]>([]);

  protected readonly serverStateTutors = computed(() =>
    this.staffUsers().filter((user) => user.role === Role.TUTOR),
  );
  protected readonly draftStateTutors = signal<User[]>([]);

  private readonly groupPartition = toSignal(
    combineLatest([this.courseId$, this.refreshGroupPartition$]).pipe(
      switchMap(([id]) =>
        this.assignmentService.getTutorAssignmentPartition(id),
      ),
    ),
  );
  protected readonly serverStatePartition = computed(
    () => this.groupPartition()?.partition ?? [],
  );
  protected readonly draftStatePartition = signal<EditPartition[] | undefined>(
    undefined,
  );
  protected readonly groups = computed(
    () => this.groupPartition()?.groups ?? [],
  );

  protected readonly serverStateCourse = toSignal(
    combineLatest([this.courseId$, this.refreshCourse$]).pipe(
      switchMap(([id]) =>
        this.courseService.getCourseInstance<CourseInstance>(
          id,
          SerializerType.NORMAL,
        ),
      ),
    ),
  );
  protected readonly draftStateCourse = signal<CourseInstance | undefined>(
    undefined,
  );

  protected readonly serverStateDueDateCourseInstance = toSignal(
    combineLatest([this.courseId$, this.refreshDueDates$]).pipe(
      switchMap(([id]) =>
        this.courseService.getCourseInstance<DueDateCourseInstance>(
          id,
          SerializerType.DUE_DATE,
        ),
      ),
      map((value) => ({
        ...value,
        assignments: value.assignments.map((assignment) => ({
          ...assignment,
          dueTo: new Date(assignment.dueTo),
        })),
      })),
    ),
  );
  protected readonly draftStateDueDateCourseInstance = signal<
    DueDateCourseInstance | undefined
  >(undefined);

  protected readonly serverStateStudents = toSignal(
    combineLatest([this.courseId$, this.refreshStudents$]).pipe(
      switchMap(([id]) =>
        this.hasAdvancedAuthorization()
          ? this.studentService.getStudents('course_instance_id', id)
          : of([]),
      ),
    ),
  );
  protected readonly draftStateStudents = signal<Student[]>([]);

  activeTab: string = '0';

  constructor() {
    this.route.queryParams.subscribe((params) => {
      this.activeTab = params['tab'] || '0';
    });

    effect(() => {
      const data = this.staffUsers();
      this.draftStateTutors.set(
        structuredClone(data.filter((u) => u.role === Role.TUTOR)),
      );
      this.draftStateCourseLeaders.set(
        structuredClone(data.filter((u) => u.role === Role.COURSE_LEADER)),
      );
    });

    effect(() => {
      const data = this.serverStatePartition();
      if (data) this.draftStatePartition.set(structuredClone(data));
    });

    effect(() => {
      const data = this.serverStateCourse();
      if (data) this.draftStateCourse.set(structuredClone(data));
    });

    effect(() => {
      const data = this.serverStateDueDateCourseInstance();
      if (data) this.draftStateDueDateCourseInstance.set(structuredClone(data));
    });

    effect(() => {
      const data = this.serverStateStudents();
      if (data) this.draftStateStudents.set(structuredClone(data));
    });
  }

  private readonly partitionIsDirty = computed(
    () =>
      JSON.stringify(this.serverStatePartition()) !==
      JSON.stringify(this.draftStatePartition()),
  );
  private readonly courseIsDirty = computed(
    () =>
      JSON.stringify(this.serverStateCourse()) !==
      JSON.stringify(this.draftStateCourse()),
  );
  private readonly staffIsDirty = computed(
    () =>
      JSON.stringify(this.serverStateTutors()) !==
        JSON.stringify(this.draftStateTutors()) ||
      JSON.stringify(this.serverStateCourseLeaders()) !==
        JSON.stringify(this.draftStateCourseLeaders()),
  );
  private readonly dueDatesIsDirty = computed(
    () =>
      JSON.stringify(this.serverStateDueDateCourseInstance()) !==
      JSON.stringify(this.draftStateDueDateCourseInstance()),
  );
  private readonly studentsIsDirty = computed(
    () =>
      JSON.stringify(this.serverStateStudents()) !==
      JSON.stringify(this.draftStateStudents()),
  );

  private readonly isDirty = computed(
    () =>
      this.partitionIsDirty() ||
      this.courseIsDirty() ||
      this.staffIsDirty() ||
      this.dueDatesIsDirty() ||
      this.studentsIsDirty(),
  );

  protected onTabChange(newValue: string | number | undefined) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: newValue },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  public checkChanges(): boolean | Promise<boolean> {
    if (!this.isDirty()) return true;
    return this.confirmDialog();
  }

  private confirmDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: this.translationService.translate(
          'common.confirmation.message-unsaved',
        ),
        header: this.translationService.translate('common.confirmation.header'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }

  protected onSaveBtnClick() {
    if (!this.isDirty()) {
      this.toastService.info('common.noChangesInfo');
      return;
    }

    const tasks: Observable<unknown>[] = [];

    // 2. Partition
    if (this.partitionIsDirty()) {
      tasks.push(
        this.assignmentService
          .putAssignmentPartition(this.courseId(), this.draftStatePartition()!)
          .pipe(tap(() => this.refreshGroupPartition$.next())),
      );
    }

    // 3. Course Settings
    if (this.courseIsDirty()) {
      const draft = this.draftStateCourse()!;
      const fn = draft.fileName.endsWith('.pdf')
        ? draft.fileName
        : `${draft.fileName}.pdf`;
      tasks.push(
        this.courseService
          .patchCourseInstance(this.courseId(), SerializerType.NORMAL, {
            allowLateSubmission: draft.allowLateSubmission,
            lateSubmissionPenalty: draft.lateSubmissionPenalty,
            pointStepSize: draft.pointStepSize,
            fileName: fn,
          })
          .pipe(tap(() => this.refreshCourse$.next())),
      );
    }

    // 4. Staff
    if (this.staffIsDirty()) {
      const patch = {
        courseLeaders: this.draftStateCourseLeaders()!.map(
          (user) => user.username,
        ),
        tutors: this.draftStateTutors()!.map((user) => user.username),
      };
      tasks.push(
        this.courseService
          .patchCourseInstance(this.courseId(), SerializerType.STAFF, patch)
          .pipe(tap(() => this.refreshStaffUsers$.next())),
      );
    }

    // 5. Due Dates
    if (this.dueDatesIsDirty()) {
      const draft = this.draftStateDueDateCourseInstance()!;
      const patch = {
        ...draft,
        assignments: draft.assignments.map((assignment) => ({
          ...assignment,
          dueTo: assignment.dueTo.toISOString(),
        })),
      };
      tasks.push(
        this.courseService
          .patchCourseInstance(this.courseId(), SerializerType.DUE_DATE, patch)
          .pipe(tap(() => this.refreshDueDates$.next())),
      );
    }

    // 6. Students (Unenrollment)
    if (this.studentsIsDirty()) {
      const studentsToRemove = this.serverStateStudents()!.filter(
        (student) =>
          !this.draftStateStudents()!.some((curr) => curr.id === student.id),
      );

      const removalTasks = studentsToRemove.map((s) =>
        this.degreeProgramService.unEnrollStudent(this.courseId(), s),
      );

      if (removalTasks.length > 0) {
        tasks.push(
          forkJoin(removalTasks).pipe(tap(() => this.refreshStudents$.next())),
        );
      }
    }

    forkJoin(tasks).subscribe({
      next: () => {
        this.toastService.info('common.saved');
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('common.error-saving');
      },
    });
  }

  protected readonly Role = Role;

  protected updateDueDateCourseInstance(event: DueDateCourseInstance) {
    this.draftStateDueDateCourseInstance.set(event);
  }
}
