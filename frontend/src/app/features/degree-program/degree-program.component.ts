import { Component, OnInit } from '@angular/core';
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
  `
})
export class DegreeProgramComponent implements OnInit {
  items: MenuItem[];
  activeItem: MenuItem;

  degreeProgramAbbreviation: string = '';

  constructor(
    private route: ActivatedRoute,
    private translationService: TranslationService,
    private router: Router,
  ) {
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
            command() {
              router.navigate(['staff', 'all'], { relativeTo: route }).then();
            },
          },
          {
            label: this.translationService.translate(
              'degree-program.staff-view.all-users',
            ),
            command() {
              router
                .navigate(['staff', 'no-staff'], { relativeTo: route })
                .then();
            },
          },
          {
            label: this.translationService.translate(
              'degree-program.staff-view.new-user',
            ),
            command() {
              router.navigate(['staff', 'form'], { relativeTo: route }).then();
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
            command() {
              router.navigate(['courses', 'all'], { relativeTo: route }).then();
            },
          },
          {
            label: this.translationService.translate(
              'degree-program.courses-view.course-instances',
            ),
            command() {
              router
                .navigate(['courses', 'instances'], { relativeTo: route })
                .then();
            },
          },
          {
            label: this.translationService.translate(
              'degree-program.courses-view.new-course',
            ),
            command() {
              router
                .navigate(['courses', 'form'], { relativeTo: route })
                .then();
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
            command() {
              router.navigate(['class', 'list'], { relativeTo: route }).then();
            },
          },
          {
            label: this.translationService.translate(
              'degree-program.class-groups-view.new-class-group',
            ),
            command() {
              router.navigate(['class', 'form'], { relativeTo: route }).then();
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
            command() {
              router
                .navigate(['student', 'list'], { relativeTo: route })
                .then();
            },
          },
          {
            label: this.translationService.translate(
              'degree-program.students-view.new-student',
            ),
            command() {
              router
                .navigate(['student', 'form'], { relativeTo: route })
                .then();
            },
          },
        ],
      },
      {
        label: enrollments,
        command: () => {
          router.navigate(['enrollment'], { relativeTo: route }).then();
        },
      },
    ];
    this.activeItem = this.items[1];
  }

  ngOnInit() {
    this.degreeProgramAbbreviation = this.route.snapshot.params['abbreviation'];
  }

  setActiveItem(label: string) {
    this.activeItem = this.items.find((item) => item.label === label)!;
  }
}
