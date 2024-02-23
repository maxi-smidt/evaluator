import {Component, OnInit} from '@angular/core';
import {BaseAssignment} from "../../../../interfaces/base-assignment";
import {CourseService} from "../../../../services/course.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Course} from "../../../../interfaces/course";

@Component({
  selector: 'ms-course-view',
  templateUrl: './course-view.component.html',
  styleUrls: ['./course-view.component.css']
})
export class CourseViewComponent implements OnInit {
  course: Course;

  constructor(private courseService: CourseService,
              private route: ActivatedRoute,
              private router: Router) {
    this.course = {id: -1, name: '', exercises: []};
  }

  ngOnInit() {
    const courseId = this.route.snapshot.params['courseId'];
    this.courseService.getFullCourse(Number(courseId)).subscribe({
      next: course => {
        this.course = course;
      }
    })
  }

  getExerciseStateClass(bE: BaseAssignment) {
    if (bE.correctedParticipants === bE.maxParticipants) {
      return 'list-group-item-primary';
    }

    switch (bE.state) {
      case 'EXPIRED':
        return 'list-group-item-danger';
      case 'INACTIVE':
        return 'list-group-item-secondary';
      default:
        return 'list-group-item-success';
    }
  }

  onAssignmentClick(assignment: BaseAssignment) {
    this.router.navigate(['assignment', assignment.id], {relativeTo: this.route}).then();
  }

  onEditBtnClick() {
    this.router.navigate(['edit'], {relativeTo: this.route}).then();
  }

}
