import {Component, OnInit} from '@angular/core';
import {Button} from "primeng/button";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {TranslatePipe} from "../../pipes/translate.pipe";
import {MessageService} from "primeng/api";
import {TranslationService} from "../../services/translation.service";
import {CourseService} from "../../../features/course/services/course.service";
import {Course} from "../../../features/course/models/course.model";
import {DegreeProgram} from "../../../features/degree-program/models/degree-program.model";
import {InputGroupModule} from "primeng/inputgroup";
import {InputGroupAddonModule} from "primeng/inputgroupaddon";
import {InputTextModule} from "primeng/inputtext";
import {DegreeProgramService} from "../../../features/degree-program/services/degree-program.service";
import {NgIf} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {UrlParamService} from "../../services/url-param.service";
import {CheckboxModule} from "primeng/checkbox";

@Component({
  selector: 'ms-course-form',
  standalone: true,
  imports: [
    Button,
    ConfirmDialogModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    NgIf,
    CheckboxModule
  ],
  templateUrl: './course-form.component.html'
})
export class CourseFormComponent implements OnInit {
  degreeProgramAbbreviation: string | null = null;
  degreeProgram: DegreeProgram = {} as DegreeProgram;
  submitted = false;
  redirect: boolean = false;

  checkoutForm = this.formBuilder.group({
    name: ['', Validators.required],
    abbreviation: ['', Validators.required],
    text1: ['', Validators.required],
    text2: '',
    text3: ''
  });

  constructor(private messageService: MessageService,
              private formBuilder: FormBuilder,
              private translationService: TranslationService,
              private courseService: CourseService,
              private degreeProgramService: DegreeProgramService,
              private route: ActivatedRoute,
              private router: Router,
              private urlParamService: UrlParamService) {
  }

  ngOnInit() {
    this.degreeProgramAbbreviation = this.urlParamService.findParam('abbreviation', this.route);

    this.degreeProgramService.getDegreeProgram(this.degreeProgramAbbreviation!).subscribe({
      next: value => {
        this.degreeProgram = value;
      }
    });
  }

  get f() {
    return this.checkoutForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.checkoutForm.invalid) {
      return;
    }

    const formValue = this.checkoutForm.value;
    const fileName = `${formValue.text1}_{lastname}_${formValue.text2}{nr}_${formValue.text3}.pdf`;
    const course: Course = {id: -1, name: formValue.name!, abbreviation: formValue.abbreviation!, fileName: fileName};

    this.courseService.createCourse(this.degreeProgram, course).subscribe({
      next: value => {
        this.submitted = false;
        this.checkoutForm.reset();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.translationService.translate('common.saved')
        });

        if (this.redirect) {
          this.router.navigate(['course', value.id]).then();
        }
      },
      error: err => {
        if (err.status == 500) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.translationService.translate('shared.forms.course-form.error-500')
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.translationService.translate('shared.forms.course-form.error-else')
          });
        }
      }
    });
  }
}
