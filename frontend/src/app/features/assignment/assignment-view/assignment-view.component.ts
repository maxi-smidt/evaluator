import {Component, OnInit} from '@angular/core';
import {Assignment} from "../models/assignment.model";
import {AssignmentService} from "../services/assignment.service";
import {ActivatedRoute} from "@angular/router";
import {JsonEditorOptions, NgJsonEditorModule} from "ang-jsoneditor";
import {FloatLabelModule} from "primeng/floatlabel";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {Button} from "primeng/button";
import {MessageService} from "primeng/api";
import {TranslationService} from "../../../shared/services/translation.service";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";

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
  templateUrl: './assignment-view.component.html'
})
export class AssignmentViewComponent implements OnInit {
  assignmentBefore: Assignment = {} as Assignment;
  assignment: Assignment = {} as Assignment;
  shownDraft: any;
  exampleData: any;

  public editorOptions: JsonEditorOptions;

  constructor(private assignmentService: AssignmentService,
              private route: ActivatedRoute,
              private messageService: MessageService,
              private translationService: TranslationService) {
    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.expandAll = true;
    this.editorOptions.mode = 'tree';

    this.exampleData = [
      {
        "name": "Beispiel 1",
        "distribution": [
          {"name": "Lösungsidee", "points": 10},
          {"name": "Quellcode", "points": 57},
          {"name": "Testfälle", "points": 33}
        ]
      },
      {
        "name": "Beispiel 2",
        "distribution": [
          {"name": "Lösungsidee", "points": 10},
          {"name": "Quellcode", "points": 57},
          {"name": "Testfälle", "points": 33}
        ]
      }
    ]
  }

  ngOnInit() {
    const assignmentId = this.route.snapshot.params['assignmentId'];
    this.assignmentService.getAssignment(assignmentId).subscribe({
      next: value => {
        this.assignment = value;
        this.assignmentBefore = JSON.parse(JSON.stringify(value));
        this.shownDraft = JSON.parse(JSON.stringify(value.draft));
      }
    });
  }

  getData(event: any) {
    this.assignment.draft = event;
    this.calculatePoints();
  }

  calculatePoints() {
    this.assignment.points = this.assignment.draft.reduce((total, exercise) => {
      return total + exercise.distribution.reduce((subTotal, subExercise) => {
        return subTotal + subExercise.points;
      }, 0);
    }, 0);
  }

  hasChanged(): boolean {
    return JSON.stringify(this.assignment) !== JSON.stringify(this.assignmentBefore);
  }

  onSubmit() {
    if (!this.hasChanged()) {
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: this.translationService.translate('common.noChangesInfo')
      });
      return;
    }

    this.assignmentService.putAssignment(this.assignment).subscribe({
      next: value => {
        this.assignment = value;
        this.assignmentBefore = JSON.parse(JSON.stringify(value));
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.translationService.translate('common.saved')
        });
      }
    });
  }
}
