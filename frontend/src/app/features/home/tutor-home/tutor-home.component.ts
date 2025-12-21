import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
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
  private courseService = inject(CourseService);
  private translationService = inject(TranslationService);

  protected courseInstances: SimpleCourseInstance[] = [];
  protected yearItems: WritableSignal<string[]> = signal([]);
  protected allString: string =
    this.translationService.translate('home.tutorHome.all');
  protected selectedYear: string = this.allString;

  public ngOnInit() {
    this.courseService.getCourseInstances().subscribe({
      next: (courseInstances) => {
        this.courseInstances = courseInstances;
        this.fillItems();
      },
    });
  }

  private fillItems() {
    const years = new Set(this.courseInstances.map((ci) => ci.year.toString()));
    this.yearItems.set([...years, this.allString]);
  }
}
