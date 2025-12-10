import { Component, OnInit } from '@angular/core';
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
import { ChartData } from '../../models/chart-data.model';
import { ChartModule } from 'primeng/chart';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'ms-course-instance-view',
    templateUrl: './course-instance-view.component.html',
    imports: [
        ButtonModule,
        TranslatePipe,
        NgClass,
        BadgeModule,
        ChartModule,
        TabViewModule,
        TooltipModule,
    ]
})
export class CourseInstanceViewComponent implements OnInit {
  courseInstance: DetailCourseInstance | undefined;

  expenseChartData: ChartData | undefined;
  pointsChartData: ChartData | undefined;
  options: { aspectRatio: number } | undefined;

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    const courseId = this.route.snapshot.params['courseId'];
    this.courseService
      .getCourseInstance<DetailCourseInstance>(
        Number(courseId),
        SerializerType.DETAIL,
      )
      .subscribe({
        next: (course) => {
          this.courseInstance = course;
        },
      });

    this.courseService.getChartData(courseId).subscribe({
      next: (data) => {
        this.expenseChartData = data.dataExpense;
        this.pointsChartData = data.dataPoints;
      },
    });

    this.options = {
      aspectRatio: 1.5,
    };
  }

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
