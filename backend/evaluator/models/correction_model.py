from django.db import models

from .assignment_instance_model import AssignmentInstance
from .student_model import Student
from user.models import Tutor

class Correction(models.Model):
    class Status(models.TextChoices):
        NOT_SUBMITTED = "NOT_SUBMITTED", "not submitted"
        CORRECTED = "CORRECTED", "corrected"
        IN_PROGRESS = "IN_PROGRESS", "in progress"
        UNDEFINED = "UNDEFINED", "undefined"

    student = models.ForeignKey(Student,
                                on_delete=models.SET_NULL,
                                null=True,
                                related_name="co_student")
    tutor = models.ForeignKey(Tutor,
                              on_delete=models.SET_NULL,
                              null=True,
                              related_name='co_tutor')
    assignment_instance = models.ForeignKey(AssignmentInstance,
                                            on_delete=models.SET_NULL,
                                            null=True,
                                            related_name="co_assignment_instance")
    expense = models.DurationField(null=True)
    status = models.CharField(max_length=50,
                              choices=Status,
                              null=False,
                              default=Status.UNDEFINED)
    points = models.DecimalField(decimal_places=3,
                                 max_digits=6,
                                 null=True)
    draft = models.JSONField(null=True)
    late_submitted_days = models.IntegerField(null=False,
                                              default=0)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)
    late_submission_penalty = models.DecimalField(decimal_places=3,
                                                  max_digits=6,
                                                  null=True,
                                                  default=None)

    def save(self, *args, **kwargs):
        if self.late_submission_penalty is None:
            self.late_submission_penalty = self.assignment_instance.course_instance.late_submission_penalty
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student} - {self.assignment_instance} - {self.tutor} - {self.status}"
