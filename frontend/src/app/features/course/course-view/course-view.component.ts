import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {xCourseInstance} from "../models/course.model";
import {CourseService} from "../services/course.service";
import {ButtonModule} from "primeng/button";
import {TranslatePipe} from "../../../shared/pipes/translate.pipe";
import {NgClass} from "@angular/common";
import {BadgeModule} from "primeng/badge";
import {SimpleAssignment} from "../models/assignment.model";

@Component({
  selector: 'ms-course-view',
  templateUrl: './course-view.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    TranslatePipe,
    NgClass,
    BadgeModule
  ]
})
export class CourseViewComponent implements OnInit {
  courseInstance: xCourseInstance | undefined;

  constructor(private courseService: CourseService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    const courseId = this.route.snapshot.params['courseId'];
    this.courseService.getFullCourse(Number(courseId)).subscribe({
      next: course => {
        this.courseInstance = course;
      }
    })
  }

  getExerciseStateClass(bE: SimpleAssignment) {
    if (bE.correctedParticipants === bE.maxParticipants) {
      return 'list-group-item-primary';
    }

    switch (bE.status) {
      case 'EXPIRED':
        return 'list-group-item-danger';
      case 'INACTIVE':
        return 'list-group-item-secondary';
      default:
        return 'list-group-item-success';
    }
  }

  onAssignmentClick(assignment: SimpleAssignment) {
    this.router.navigate(['assignment', assignment.id], {relativeTo: this.route}).then();
  }

  onEditBtnClick() {
    this.router.navigate(['edit'], {relativeTo: this.route}).then();
  }

}
