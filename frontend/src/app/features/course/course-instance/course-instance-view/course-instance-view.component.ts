import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DetailCourseInstance,
  SerializerType,
} from '../../models/course.model';
import { CourseService } from '../../services/course.service';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { NgClass } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import {
  AssignmentStatus,
  SimpleAssignmentInstance,
} from '../../../assignment/models/assignment.model';
import { ChartModule } from 'primeng/chart';
import { TooltipModule } from 'primeng/tooltip';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'ms-course-instance-view',
  templateUrl: './course-instance-view.component.html',
  imports: [
    ButtonModule,
    TranslatePipe,
    NgClass,
    BadgeModule,
    ChartModule,
    TooltipModule,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
  ],
})
export class CourseInstanceViewComponent {
  private readonly courseService = inject(CourseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected options: { aspectRatio: number } = { aspectRatio: 1.5 };

  private courseId$ = this.route.params.pipe(
    map((params) => Number(params['courseId'])),
  );
  protected courseInstance = toSignal(
    this.courseId$.pipe(
      switchMap((id) =>
        this.courseService.getCourseInstance<DetailCourseInstance>(
          id,
          SerializerType.DETAIL,
        ),
      ),
    ),
  );
  protected chartData = toSignal(
    this.courseId$.pipe(switchMap((id) => this.courseService.getChartData(id))),
  );
  protected expenseChartData = computed(() => this.chartData()?.dataExpense);
  protected pointsChartData = computed(() => this.chartData()?.dataPoints);

  getExerciseStateClass(simpleAssignment: SimpleAssignmentInstance) {
    switch (simpleAssignment.status) {
      case AssignmentStatus.EXPIRED:
        return simpleAssignment.participantsLeft === 0
          ? 'list-group-item-success'
          : 'list-group-item-danger';
      case AssignmentStatus.INACTIVE:
        return 'list-group-item-secondary';
      case AssignmentStatus.ACTIVE:
        return simpleAssignment.participantsLeft === 0
          ? 'list-group-item-success'
          : 'list-group-item-primary';
    }
  }

  routeToAssignmentInstance(assignment: SimpleAssignmentInstance) {
    this.router.navigate(['assignment', 'instance', assignment.id]).then();
  }

  routeToEdit() {
    this.router.navigate(['edit'], { relativeTo: this.route }).then();
  }

  protected readonly AssignmentStatus = AssignmentStatus;
}
