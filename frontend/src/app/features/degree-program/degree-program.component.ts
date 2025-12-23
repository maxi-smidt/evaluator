import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TranslationService } from '../../shared/services/translation.service';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'ms-degree-program',
  imports: [RouterOutlet, MenubarModule],
  template: `
    <div style="margin-top: -30px">
      <p-menubar [model]="items" />
    </div>
    <div class="container mt-4 border border-2 rounded-2 p-2">
      <router-outlet />
    </div>
  `,
})
export class DegreeProgramComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly translationService = inject(TranslationService);
  private readonly router = inject(Router);

  items: MenuItem[];
  activeItem: MenuItem;

  degreeProgramAbbreviation: string = '';

  constructor() {
    const staff = this.translationService.translate('degree-program.staff');
    const courses = this.translationService.translate('degree-program.courses');
    const classes = this.translationService.translate(
      'degree-program.class-groups',
    );
    const students = this.translationService.translate(
      'degree-program.students',
    );
    const enrollments = this.translationService.translate(
      'degree-program.enrollments',
    );
    this.items = [
      {
        label: staff,
        command: () => {
          this.setActiveItem(staff);
        },
        items: [
          {
            label: this.translationService.translate(
              'degree-program.staff-view.active-users',
            ),
            command: () => {
              void this.router.navigate(['staff', 'all'], {
                relativeTo: this.route,
              });
            },
          },
          {
            label: this.translationService.translate(
              'degree-program.staff-view.all-users',
            ),
            command: () => {
              void this.router.navigate(['staff', 'no-staff'], {
                relativeTo: this.route,
              });
            },
          },
          {
            label: this.translationService.translate(
              'degree-program.staff-view.new-user',
            ),
            command: () => {
              void this.router.navigate(['staff', 'form'], {
                relativeTo: this.route,
              });
            },
          },
        ],
      },
      {
        label: courses,
        command: () => this.setActiveItem(courses),
        items: [
          {
            label: this.translationService.translate(
              'degree-program.courses-view.courses',
            ),
            command: () => {
              void this.router.navigate(['courses', 'all'], {
                relativeTo: this.route,
              });
            },
          },
          {
            label: this.translationService.translate(
              'degree-program.courses-view.course-instances',
            ),
            command: () => {
              void this.router.navigate(['courses', 'instances'], {
                relativeTo: this.route,
              });
            },
          },
          {
            label: this.translationService.translate(
              'degree-program.courses-view.new-course',
            ),
            command: () => {
              void this.router.navigate(['courses', 'form'], {
                relativeTo: this.route,
              });
            },
          },
        ],
      },
      {
        label: classes,
        command: () => {
          this.setActiveItem(classes);
        },
        items: [
          {
            label: this.translationService.translate(
              'degree-program.class-groups-view.all-class-groups',
            ),
            command: () => {
              void this.router.navigate(['class', 'list'], {
                relativeTo: this.route,
              });
            },
          },
          {
            label: this.translationService.translate(
              'degree-program.class-groups-view.new-class-group',
            ),
            command: () => {
              void this.router.navigate(['class', 'form'], {
                relativeTo: this.route,
              });
            },
          },
        ],
      },
      {
        label: students,
        command: () => {
          this.setActiveItem(students);
        },
        items: [
          {
            label: this.translationService.translate(
              'degree-program.students-view.all-students',
            ),
            command: () => {
              void this.router.navigate(['student', 'list'], {
                relativeTo: this.route,
              });
            },
          },
          {
            label: this.translationService.translate(
              'degree-program.students-view.new-student',
            ),
            command: () => {
              void this.router.navigate(['student', 'form'], {
                relativeTo: this.route,
              });
            },
          },
        ],
      },
      {
        label: enrollments,
        command: () => {
          void this.router.navigate(['enrollment'], { relativeTo: this.route });
        },
      },
    ];
    this.activeItem = this.items[1];
  }

  private setActiveItem(label: string) {
    this.activeItem = this.items.find((item) => item.label === label)!;
  }
}
