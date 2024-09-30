import { Component, OnInit } from '@angular/core';
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
import { PreviousDeductions } from '../../previous-deductions/models/previous-deduction.model';
import { PreviousDeductionsService } from '../../previous-deductions/services/previous-deductions.service';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';
import { TranslationService } from '../../../shared/services/translation.service';
import { Message } from 'primeng/api';

@Component({
  selector: 'ms-assignment-view',
  standalone: true,
  imports: [
    NgJsonEditorModule,
    FloatLabelModule,
    FormsModule,
    InputTextModule,
    Button,
    TranslatePipe,
    InputTextareaModule,
    MessagesModule,
  ],
  templateUrl: './assignment-view.component.html',
})
export class AssignmentViewComponent implements OnInit {
  serviceMessage: Message[];

  assignmentBefore: Assignment = {} as Assignment;
  assignment: Assignment = {} as Assignment;
  shownDraft: object | undefined;

  previousDeductions: PreviousDeductions | undefined;

  exampleDraft: object;
  examplePreviousDeductions: object;

  draftTextField: string | undefined;
  previousDeductionsTextField: string | undefined;

  public editorOptions: JsonEditorOptions;

  constructor(
    private assignmentService: AssignmentService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private previousDeductionsService: PreviousDeductionsService,
    private translationService: TranslationService,
  ) {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.expandAll = true;
    this.editorOptions.mode = 'tree';

    this.serviceMessage = [
      {
        severity: 'warn',
        detail: this.translationService.translate(
          'assignment.not-working-message',
        ),
      },
    ];

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

  ngOnInit() {
    const assignmentId = this.route.snapshot.params['assignmentId'];
    this.assignmentService.getAssignment(assignmentId).subscribe({
      next: (value) => {
        this.assignment = value;
        this.assignmentBefore = JSON.parse(JSON.stringify(value));
        this.shownDraft = JSON.parse(JSON.stringify(value.draft));
      },
    });
    this.previousDeductionsService
      .getPreviousDeductions(assignmentId, 'assignment')
      .subscribe({
        next: (value) => {
          this.previousDeductions = value;
        },
        error: () => {
          this.previousDeductions = undefined;
        },
      });
  }

  getData(event: Exercise[]) {
    this.assignment.draft = event;
    this.calculatePoints();
  }

  calculatePoints() {
    this.assignment.points = this.assignment.draft.reduce((total, exercise) => {
      return (
        total +
        exercise.distribution.reduce((subTotal, subExercise) => {
          return subTotal + subExercise.points;
        }, 0)
      );
    }, 0);
  }

  draftHasChanged(): boolean {
    return (
      JSON.stringify(this.assignment) !== JSON.stringify(this.assignmentBefore)
    );
  }

  onSubmit() {
    if (!this.draftHasChanged()) {
      this.toastService.info('common.noChangesInfo');
      return;
    }

    this.assignmentService.putAssignment(this.assignment).subscribe({
      next: (value) => {
        this.assignment = value;
        this.assignmentBefore = JSON.parse(JSON.stringify(value));
        this.toastService.success('common.saved');
      },
    });
  }

  onPreviousDeductionsQuickUpload() {
    if (this.previousDeductions === undefined) {
      this.previousDeductionsService
        .createPreviousDeductions(
          this.previousDeductionsTextField!,
          this.assignment.id,
        )
        .subscribe({
          next: () => (this.previousDeductionsTextField = undefined),
        });
    } else {
      this.previousDeductionsService
        .putPreviousDeductions(
          this.assignment.id,
          this.previousDeductionsTextField!,
          'assignment',
        )
        .subscribe({
          next: () => (this.previousDeductionsTextField = undefined),
        });
    }
  }

  onDraftQuickUpload() {
    this.assignment.draft = JSON.parse(this.draftTextField!);
    this.assignmentService.putAssignment(this.assignment).subscribe({
      next: () => (this.draftTextField = undefined),
    });
  }
}
