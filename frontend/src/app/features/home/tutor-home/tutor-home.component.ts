import { Component, OnInit } from '@angular/core';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { CourseCardComponent } from './course-card/course-card.component';
import { SimpleCourseInstance } from '../../course/models/course.model';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../../shared/services/translation.service';
import { CourseService } from '../../course/services/course.service';

@Component({
  selector: 'ms-tutor-home',
  templateUrl: './tutor-home.component.html',
  imports: [TranslatePipe, CourseCardComponent, SelectModule, FormsModule],
})
export class TutorHomeComponent implements OnInit {
  courseInstances: SimpleCourseInstance[] = [];
  yearItems: string[] = [];
  selectedYear: string | undefined;
  allString: string;

  constructor(
    private courseService: CourseService,
    private translationService: TranslationService,
  ) {
    this.allString = this.translationService.translate('home.tutorHome.all');
  }

  ngOnInit() {
    this.courseService.getCourseInstances().subscribe({
      next: (courseInstances) => {
        this.courseInstances = courseInstances;
        this.fillItems();
      },
    });
  }

  private fillItems() {
    const years = this.courseInstances.map((ci) => ci.year.toString());

    this.yearItems = years.filter(
      (oldYear, index, self) =>
        index ===
        self.findIndex((newYear) => newYear === oldYear && newYear === oldYear),
    );

    this.yearItems.push(this.allString);
    this.selectedYear = this.allString;
  }
}
