import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";
import {MenuItem} from "primeng/api";
import {TranslationService} from "../../shared/services/translation.service";
import {MenubarModule} from "primeng/menubar";

@Component({
  selector: 'ms-degree-program',
  standalone: true,
  imports: [
    RouterOutlet,
    MenubarModule
  ],
  template: `
    <div style="margin-top: -30px">
      <p-menubar [model]="items"/>
    </div>
    <div class="container mt-4 border border-3 rounded-3 p-2">
      <router-outlet></router-outlet>
    </div>
  `
})
export class DegreeProgramComponent implements OnInit {
  items: MenuItem[];
  activeItem: MenuItem;

  degreeProgramAbbreviation: string = '';

  constructor(private route: ActivatedRoute,
              private translationService: TranslationService,
              private router: Router) {
    const staff = this.translationService.translate('degree-program.staff');
    const courses = this.translationService.translate('degree-program.courses');
    const classes = this.translationService.translate('degree-program.classes');

    this.items = [
      {
        label: staff,
        command: () => {
          this.setActiveItem(staff);
        },
        items: [
          {
            label: this.translationService.translate('degree-program.staff-view.active-users'),
            command() {
              router.navigate(['staff', 'all'], {relativeTo: route}).then();
            }
          },
          {
            label: this.translationService.translate('degree-program.staff-view.all-users'),
            command() {
              router.navigate(['staff', 'no-staff'], {relativeTo: route}).then();
            }
          },
          {
            label: this.translationService.translate('degree-program.staff-view.new-user'),
            command() {
              router.navigate(['staff', 'form'], {relativeTo: route}).then();
            }
          }
        ]
      },
      {
        label: courses,
        command: () => this.setActiveItem(courses),
        items: [
          {
            label: this.translationService.translate('degree-program.courses-view.courses'),
            command() {
              router.navigate(['courses', 'all'], {relativeTo: route}).then();
            }
          },
          {
            label: this.translationService.translate('degree-program.courses-view.course-instances'),
            command() {
              router.navigate(['courses', 'instances'], {relativeTo: route}).then();
            }
          },
          {
            label: this.translationService.translate('degree-program.courses-view.new-course'),
            command() {
              router.navigate(['courses', 'form'], {relativeTo: route}).then();
            }
          }
        ]
      },
      {
        label: classes,
        command: () => this.setActiveItem(classes)
      }
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
