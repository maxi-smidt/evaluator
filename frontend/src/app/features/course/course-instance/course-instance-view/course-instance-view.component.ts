import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {DetailCourseInstance, SerializerType} from "../../models/course.model";
import {CourseService} from "../../services/course.service";
import {ButtonModule} from "primeng/button";
import {TranslatePipe} from "../../../../shared/pipes/translate.pipe";
import {NgClass} from "@angular/common";
import {BadgeModule} from "primeng/badge";
import {SimpleAssignmentInstance} from "../../../assignment/models/assignment.model";
import {ChartData} from "../../models/chart-data.model";
import {ChartModule} from "primeng/chart";
import {TabViewModule} from "primeng/tabview";

@Component({
  selector: 'ms-course-instance-view',
  templateUrl: './course-instance-view.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    TranslatePipe,
    NgClass,
    BadgeModule,
    ChartModule,
    TabViewModule
  ]
})
export class CourseInstanceViewComponent implements OnInit {
  courseInstance: DetailCourseInstance | undefined;

  expenseChartData: ChartData | undefined;
  pointsChartData: ChartData | undefined;
  options: {} | undefined;

  constructor(private courseService: CourseService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    const courseId = this.route.snapshot.params['courseId'];
    this.courseService.getCourseInstance<DetailCourseInstance>(Number(courseId), SerializerType.DETAIL).subscribe({
      next: course => {
        this.courseInstance = course;
      }
    });

    this.courseService.getChartData(courseId).subscribe({
      next: data => {
        this.expenseChartData = data.dataExpense;
        this.pointsChartData = data.dataPoints;
      }
    });

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    };
  }

  getExerciseStateClass(simpleAssignment: SimpleAssignmentInstance) {
    if (simpleAssignment.participantsLeft === 0) {
      return 'list-group-item-primary';
    }

    switch (simpleAssignment.status) {
      case 'EXPIRED':
        return 'list-group-item-danger';
      case 'INACTIVE':
        return 'list-group-item-secondary';
      default:
        return 'list-group-item-success';
    }
  }

  routeToAssignmentInstance(assignment: SimpleAssignmentInstance) {
    this.router.navigate(['assignment', 'instance', assignment.id]).then();
  }

  routeToEdit() {
    this.router.navigate(['edit'], {relativeTo: this.route}).then();
  }
}
