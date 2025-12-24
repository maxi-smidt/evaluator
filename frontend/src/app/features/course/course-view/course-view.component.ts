import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { CourseService } from '../services/course.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { DetailCourse } from '../models/course.model';
import { Button } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { ConfirmationService } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TranslationService } from '../../../shared/services/translation.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { AssignmentService } from '../../assignment/services/assignment.service';
import { DialogModule } from 'primeng/dialog';
import { InputOtpModule } from 'primeng/inputotp';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastService } from '../../../shared/services/toast.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-course-view',
  imports: [
    TranslatePipe,
    Button,
    DataViewModule,
    FloatLabelModule,
    InputTextModule,
    FormsModule,
    InputGroupAddonModule,
    InputGroupModule,
    ReactiveFormsModule,
    DialogModule,
    InputOtpModule,
    ConfirmPopupModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
  ],
  templateUrl: './course-view.component.html',
})
export class CourseViewComponent {
  private readonly courseService = inject(CourseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly assignmentService = inject(AssignmentService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly toastService = inject(ToastService);
  protected readonly translationService = inject(TranslationService);

  private readonly refresh$ = new BehaviorSubject<void>(undefined);
  private readonly courseId$ = this.route.params.pipe(
    map((params) => Number(params['courseId'])),
  );
  protected serverStateCourse = toSignal(
    combineLatest([this.courseId$, this.refresh$]).pipe(
      switchMap(([id, _]) => this.courseService.getDetailCourse(id)),
    ),
  );
  protected draftStateCourse = signal<DetailCourse | undefined>(undefined);

  private isDirty = computed(
    () =>
      JSON.stringify(this.serverStateCourse()) !==
      JSON.stringify(this.draftStateCourse()),
  );

  dialogVisible: boolean = false;
  newAssignmentName: string | undefined;
  newAssignmentNr: number | undefined;

  constructor() {
    effect(() => {
      const data = this.serverStateCourse();
      const currentDraft = untracked(() => this.draftStateCourse());
      if (data && (!currentDraft || data.id !== currentDraft.id)) {
        this.draftStateCourse.set(structuredClone(data));
      }
    });
  }

  protected routeToAssignment(assignmentId: number) {
    this.router.navigate(['assignment', assignmentId]).then();
  }

  protected onSubmit() {
    if (!this.isDirty()) {
      this.toastService.error('common.noChangesInfo');
      return;
    }

    const {
      assignments: _assignment,
      id: _id,
      ...payload
    } = this.draftStateCourse()!;
    this.courseService
      .patchCourse(this.serverStateCourse()!.id, payload)
      .subscribe({
        next: () => {
          this.refresh$.next();
          this.toastService.success('common.saved');
        },
      });
  }

  protected onSaveNewAssignment() {
    if (!this.newAssignmentName || !this.newAssignmentNr) {
      this.toastService.error('course.courseView.error');
      return;
    }

    this.assignmentService
      .createAssignment(
        this.serverStateCourse()!.id,
        this.newAssignmentNr,
        this.newAssignmentName,
      )
      .subscribe({
        next: (value) => {
          this.routeToAssignment(value.id);
          this.newAssignmentNr = undefined;
          this.newAssignmentName = undefined;
          this.dialogVisible = false;
        },
        error: (err) => {
          const messageKey = `course.courseView.error-${err.status === 500 ? '500' : 'else'}`;
          this.toastService.error(messageKey);
        },
      });
  }

  protected onDeleteAssignment(event: Event, assignmentId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      header: this.translationService.translate('common.confirmation.header'),
      message: this.translationService.translate(
        'common.confirmation.message-delete',
      ),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translationService.translate(
        'common.confirmation.accept',
      ),
      rejectLabel: this.translationService.translate(
        'common.confirmation.reject',
      ),
      accept: () => {
        this.assignmentService.deleteAssignment(assignmentId).subscribe({
          next: () => this.refresh$.next(),
        });
      },
    });
  }

  protected updateDraftField<K extends keyof DetailCourse>(
    key: K,
    value: DetailCourse[K],
  ) {
    this.draftStateCourse.update((current) => {
      if (!current) return undefined;
      return { ...current, [key]: value };
    });
  }
}
