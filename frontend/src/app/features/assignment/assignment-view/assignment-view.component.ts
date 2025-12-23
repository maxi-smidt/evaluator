import { Component, computed, effect, inject, signal } from '@angular/core';
import { Assignment, Exercise } from '../models/assignment.model';
import { AssignmentService } from '../services/assignment.service';
import { ActivatedRoute } from '@angular/router';
import { JsonEditorOptions, NgJsonEditorModule } from 'ang-jsoneditor';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { PreviousDeductionsService } from '../../previous-deductions/services/previous-deductions.service';
import { Textarea } from 'primeng/textarea';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-assignment-view',
  imports: [
    NgJsonEditorModule,
    FloatLabelModule,
    FormsModule,
    InputTextModule,
    Button,
    TranslatePipe,
    Textarea,
  ],
  templateUrl: './assignment-view.component.html',
})
export class AssignmentViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly assignmentService = inject(AssignmentService);
  private readonly toastService = inject(ToastService);
  private readonly previousDeductionsService = inject(
    PreviousDeductionsService,
  );

  private readonly refresh$ = new BehaviorSubject<void>(undefined);
  protected readonly assignmentId$ = this.route.params.pipe(
    map((params) => Number(params['assignmentId'])),
  );
  protected serverStateAssignment = toSignal(
    combineLatest([this.assignmentId$, this.refresh$]).pipe(
      switchMap(([id, _]) => this.assignmentService.getAssignment(id)),
    ),
  );
  protected draftStateAssignment = signal<Assignment | undefined>(undefined);

  protected previousDeductions = toSignal(
    this.assignmentId$.pipe(
      switchMap((id) =>
        this.previousDeductionsService.getPreviousDeductions(id, 'assignment'),
      ),
    ),
  );

  exampleDraft: object;
  examplePreviousDeductions: object;

  draftTextField: string | undefined;
  previousDeductionsTextField: string | undefined;

  public editorOptions: JsonEditorOptions;

  constructor() {
    effect(() => {
      const data = this.serverStateAssignment();
      if (data) {
        this.draftStateAssignment.set(structuredClone(data));
      }
    });

    effect(() => {
      const assignment = this.draftStateAssignment();

      if (!assignment) return 0;

      return assignment.draft.reduce(
        (outerAcc, exercise) =>
          outerAcc +
          exercise.distribution.reduce(
            (innerAcc, subExercise) => innerAcc + subExercise.points,
            0,
          ),
        0,
      );
    });

    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.expandAll = true;
    this.editorOptions.mode = 'tree';

    this.exampleDraft = [
      {
        name: 'Beispiel 1',
        distribution: [
          { name: 'Lösungsidee', points: 10 },
          { name: 'Quellcode', points: 57 },
          { name: 'Testfälle', points: 33 },
        ],
      },
      {
        name: 'Beispiel 2',
        distribution: [
          { name: 'Lösungsidee', points: 10 },
          { name: 'Quellcode', points: 57 },
          { name: 'Testfälle', points: 33 },
        ],
      },
    ];
    this.examplePreviousDeductions = {
      annotations: [
        {
          description: 'Zeitaufwand fehlt / nicht richtig',
          deduction: 'Kommentar',
        },
      ],
      exercises: {
        'Beispiel 1': {
          Lösungsidee: [
            {
              description:
                'Benennung des Ablaufes/Befehlsfolge laut Angabe fehlt',
              deduction: 'Kommentar',
            },
          ],
          Quellcode: [
            {
              description: 'Turtle startet bereits an x,y nicht an 0,0',
              deduction: '-2',
            },
          ],
          Testfälle: [
            {
              description: 'Code und Testfälle nicht klar getrennt',
              deduction: '-1',
            },
          ],
        },
        'Beispiel 2': {
          Analyse: [
            {
              description: 'Testfall fehlt',
              deduction: '-2',
            },
          ],
        },
      },
    };
  }

  private isDirty = computed(
    () =>
      JSON.stringify(this.serverStateAssignment()) !==
      JSON.stringify(this.draftStateAssignment()),
  );

  protected onSubmit() {
    if (!this.isDirty()) {
      this.toastService.info('common.noChangesInfo');
      return;
    }

    this.assignmentService
      .putAssignment(this.draftStateAssignment()!)
      .subscribe({
        next: () => {
          this.refresh$.next();
          this.toastService.success('common.saved');
        },
      });
  }

  protected onPreviousDeductionsQuickUpload() {
    if (this.previousDeductions === undefined) {
      this.previousDeductionsService
        .createPreviousDeductions(
          this.previousDeductionsTextField!,
          this.serverStateAssignment()!.id,
        )
        .subscribe({
          next: () => (this.previousDeductionsTextField = undefined),
        });
    } else {
      this.previousDeductionsService
        .putPreviousDeductions(
          this.serverStateAssignment()!.id,
          this.previousDeductionsTextField!,
          'assignment',
        )
        .subscribe({
          next: () => (this.previousDeductionsTextField = undefined),
        });
    }
  }

  protected onDraftQuickUpload() {
    try {
      const draftJson = JSON.parse(this.draftTextField!);
      this.draftStateAssignment.update((current) => ({
        ...current!,
        draft: draftJson,
      }));
      this.assignmentService
        .putAssignment(this.draftStateAssignment()!)
        .subscribe({
          next: () => {
            this.draftTextField = undefined;
            this.refresh$.next();
          },
        });
    } catch {
      this.toastService.error('assignment.invalid-json');
    }
  }

  protected updateDraftField<K extends keyof Assignment>(
    key: K,
    value: Assignment[K],
  ) {
    this.draftStateAssignment.update((current) => {
      if (!current) return undefined;
      return { ...current, [key]: value };
    });
  }

  protected updateAssignmentDraft(draft: Exercise[]) {
    this.draftStateAssignment.update((current) => ({ ...current!, draft }));
  }
}
