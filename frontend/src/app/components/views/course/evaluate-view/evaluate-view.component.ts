import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {CorrectionService} from "../../../../services/correction.service";
import {Correction} from "../../../../interfaces/correction";

@Component({
  selector: 'ms-evaluate-view',
  templateUrl: './evaluate-view.component.html',
  styleUrls: ['./evaluate-view.component.css']
})
export class EvaluateViewComponent implements OnInit {
  courseId: number;
  assignmentId: number;
  studentId: number;
  correction: Correction;
  correctionBefore: Correction;

  constructor(private correctionService: CorrectionService,
              private route: ActivatedRoute) {
    this.correction = {assignmentName: '', studentFullName: '',expense: 0, status: '', points: 0,
      draft: { annotations: [], exercise: [] }};
    this.correctionBefore = this.correction;
    this.studentId = -1;
    this.assignmentId = -1;
    this.courseId = -1;
  }

  ngOnInit() {
    this.courseId = this.route.parent!.parent!.snapshot.params['courseId'];
    this.assignmentId = this.route.parent!.snapshot.params['assignmentId'];
    this.studentId = this.route.snapshot.params['studentId'];
    this.correctionService.getCorrection(this.studentId, this.courseId, this.assignmentId).subscribe({
      next: correction => {
        this.correction = correction;
        this.correctionBefore = correction;
      }
    });
  }

  protected onDownloadBtnClick() {
  }

  protected onSaveFinishedBtnClick() {
  }

  protected onSaveUnFinishedBtnClick() {
  }
}
