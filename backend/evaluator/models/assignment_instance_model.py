from datetime import timedelta
from django.db import models
from django.utils import timezone
from enum import Enum

from .assignment_model import Assignment
from .course_instance_model import CourseInstance


class AssignmentInstance(models.Model):
    class Status(Enum):
        INACTIVE = "inactive"
        ACTIVE = "active"
        EXPIRED = "expired"

    assignment = models.ForeignKey(Assignment,
                                   on_delete=models.CASCADE)
    course_instance = models.ForeignKey(CourseInstance,
                                        on_delete=models.CASCADE,
                                        related_name="assignment_instances")
    due_to = models.DateTimeField()

    @property
    def status(self):
        if self.due_to <= timezone.now() <= self.due_to + timedelta(days=14):
            return self.Status.ACTIVE.name
        if timezone.now() > self.due_to + timedelta(days=14):
            return self.Status.EXPIRED.name
        return self.Status.INACTIVE.name

    class Meta:
        unique_together = ('assignment', 'course_instance')
        ordering = ['assignment__nr']

    def save(self, *args, **kwargs):
        if self.assignment.course != self.course_instance.course:
            raise ValueError("Assignment must be related to the same course as the CourseInstance")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.assignment.name} - {self.course_instance.year}"
