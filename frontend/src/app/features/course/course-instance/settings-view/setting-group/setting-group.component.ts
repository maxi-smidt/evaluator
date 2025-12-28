import { Component, computed, effect, inject, signal } from '@angular/core';
import { Student } from '../../../models/student.model';
import { DragDropModule } from 'primeng/dragdrop';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { ButtonModule } from 'primeng/button';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { ToastService } from '../../../../../shared/services/toast.service';

@Component({
  selector: 'ms-edit-group',
  templateUrl: './setting-group.component.html',
  imports: [DragDropModule, TranslatePipe, ButtonModule],
})
export class SettingGroupComponent {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private toastService = inject(ToastService);

  private readonly courseId$ = this.route.params.pipe(
    map((params) => params['courseId']),
  );
  private readonly courseId = toSignal(this.courseId$);
  private readonly refreshGroupedStudents$ = new BehaviorSubject<void>(
    undefined,
  );
  protected readonly serverStateGroupedStudents = toSignal(
    combineLatest([this.courseId$, this.refreshGroupedStudents$]).pipe(
      switchMap(([id]) => this.courseService.getStudentsInGroupsByCourse(id)),
      map((response) => ({ [-1]: [], ...response.groupedStudents })),
    ),
  );
  protected readonly draftStateGroupedStudents = signal<
    { [groupNr: number]: Student[] } | undefined
  >(undefined);

  protected groupNrs = computed(() =>
    this.draftStateGroupedStudents()
      ? Object.keys(this.draftStateGroupedStudents()!).map((x) => Number(x))
      : [],
  );

  private draggedStudent: { student: Student; group: number } | null = null;

  constructor() {
    effect(() => {
      const data = this.serverStateGroupedStudents();
      if (data) this.draftStateGroupedStudents.set(structuredClone(data));
    });
  }

  protected readonly isDirty = computed(
    () =>
      JSON.stringify(this.serverStateGroupedStudents()) !==
      JSON.stringify(this.draftStateGroupedStudents()),
  );

  protected onSaveButtonClick() {
    if (!this.isDirty()) {
      this.toastService.info('common.noChangesInfo');
      return;
    }
    this.courseService
      .patchStudentsCourseGroup(
        this.courseId(),
        this.draftStateGroupedStudents()!,
      )
      .subscribe({
        next: () => {
          this.refreshGroupedStudents$.next();
          this.toastService.success('common.saved');
        },
      });
  }

  protected onAddGroupButtonClick() {
    const existingGroups = new Set(this.groupNrs().map(Number));

    let newGroupId = 1;
    while (existingGroups.has(newGroupId)) {
      newGroupId++;
    }

    this.draftStateGroupedStudents.update((current) => ({
      ...current,
      [newGroupId]: [],
    }));
  }

  protected dragStart(student: Student, group: number) {
    this.draggedStudent = { student, group };
  }

  protected drop(newGroup: number) {
    if (!this.draggedStudent) return;

    const oldGroup = this.draggedStudent.group;
    if (oldGroup !== newGroup) {
      const student = this.draggedStudent.student;
      this.insertStudentSorted(student, newGroup);
      this.deleteStudent(student, oldGroup);
      this.draggedStudent = null;
    }
  }

  private insertStudentSorted(student: Student, group: number) {
    const index = this.draftStateGroupedStudents()![group].findIndex(
      (x) => x.lastName > student.lastName,
    );

    this.draftStateGroupedStudents.update((current) => {
      if (!current) return;
      const currentList = current[group] || [];
      let newList: Student[];
      if (index === -1) {
        newList = [...currentList, student];
      } else {
        newList = [
          ...currentList.slice(0, index),
          student,
          ...currentList.slice(index),
        ];
      }
      return {
        ...current,
        [group]: newList,
      };
    });
  }

  private deleteStudent(student: Student, group: number) {
    const index = this.findIndex(group, student);

    this.draftStateGroupedStudents.update((current) => ({
      ...current,
      [group]: current![group].filter((_, i) => i !== index),
    }));
  }

  protected dragEnd() {
    this.draggedStudent = null;
  }

  private findIndex(group: number, student: Student) {
    let index = -1;
    for (let i = 0; i < this.draftStateGroupedStudents()![group].length; i++) {
      if (student.id === this.draftStateGroupedStudents()![group][i].id) {
        index = i;
        break;
      }
    }
    return index;
  }
}
