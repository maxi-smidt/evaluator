from django.db import models

from .course_instance_model import CourseInstance
from .student_model import Student


class CourseEnrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course_instance = models.ForeignKey(CourseInstance, on_delete=models.CASCADE)
    group = models.IntegerField(null=False, default=1, max_length=2)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['student', 'course_instance'], name='course_enrollment_pk')
        ]

    def __str__(self):
        return f"{self.student} - {self.course_instance}"