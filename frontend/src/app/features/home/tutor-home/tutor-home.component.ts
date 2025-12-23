import {
  Component,
  effect,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { CourseCardComponent } from './course-card/course-card.component';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../../shared/services/translation.service';
import { CourseService } from '../../course/services/course.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ms-tutor-home',
  templateUrl: './tutor-home.component.html',
  imports: [TranslatePipe, CourseCardComponent, SelectModule, FormsModule],
})
export class TutorHomeComponent {
  private courseService = inject(CourseService);
  private translationService = inject(TranslationService);

  protected courseInstances = toSignal(this.courseService.getCourseInstances());
  protected yearItems: WritableSignal<string[]> = signal([]);

  protected allString: string =
    this.translationService.translate('home.tutorHome.all');
  protected selectedYear: string = this.allString;

  constructor() {
    effect(() => {
      if (!this.courseInstances()) return;
      const years = new Set(
        this.courseInstances()!.map((ci) => ci.year.toString()),
      );
      this.yearItems.set([...years, this.allString]);
    });
  }
}
