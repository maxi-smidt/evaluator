import { Component, computed, input, output } from '@angular/core';
import { EvaluateTableComponent } from '../evaluate-table/evaluate-table.component';
import { PreviousDeductions } from '../../../previous-deductions/models/previous-deduction.model';
import { Entry, Exercise } from '../../models/correction.model';

@Component({
  selector: 'ms-exercise-group',
  imports: [EvaluateTableComponent],
  templateUrl: './exercise-group.component.html',
})
export class ExerciseGroupComponent {
  public readonly exercise = input.required<Exercise>();
  public readonly readOnly = input.required<boolean>();
  public readonly stepSize = input.required<number>();
  public readonly showPreviousDeductions = input<boolean>(false);
  public readonly previousDeductions = input<PreviousDeductions | undefined>(
    undefined,
  );

  readonly exerciseChange = output<Exercise>();

  protected maxPoints = computed(() => {
    return this.exercise().sub.reduce((acc, sub) => acc + sub.points, 0);
  });

  protected currentPoints = computed(() =>
    this.exercise().sub.reduce(
      (acc, current) =>
        acc + this.getSubExercisePoints(current.notes, current.points),
      0,
    ),
  );

  protected getSubExercisePoints(notes: Entry[], maxPoints: number) {
    return notes.reduce((acc, current) => acc + current.points, maxPoints);
  }

  protected updateSubExercise(index: number, updatedNotes: Entry[]) {
    const currentExc = this.exercise();
    const newSubs = [...currentExc.sub];

    newSubs[index] = {
      ...newSubs[index],
      notes: updatedNotes,
    };

    this.exerciseChange.emit({
      ...currentExc,
      sub: newSubs,
    });
  }
}
