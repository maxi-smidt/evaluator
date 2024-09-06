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
  ],
  templateUrl: './assignment-view.component.html',
})
export class AssignmentViewComponent implements OnInit {
  assignmentBefore: Assignment = {} as Assignment;
  assignment: Assignment = {} as Assignment;
  shownDraft: object | undefined;
  exampleData: object;

  public editorOptions: JsonEditorOptions;

  constructor(
    private assignmentService: AssignmentService,
    private route: ActivatedRoute,
    private toastService: ToastService,
  ) {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.expandAll = true;
    this.editorOptions.mode = 'tree';

    this.exampleData = [
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

  hasChanged(): boolean {
    return (
      JSON.stringify(this.assignment) !== JSON.stringify(this.assignmentBefore)
    );
  }

  onSubmit() {
    if (!this.hasChanged()) {
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
}
