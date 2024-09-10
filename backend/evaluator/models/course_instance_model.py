from django.db import models

from .assignment_model import Assignment
from .course_model import Course
from .student_model import Student
from user.models import CourseLeader, Tutor


class CourseInstance(models.Model):
    year = models.IntegerField(null=False)
    course = models.ForeignKey(Course,
                               on_delete=models.CASCADE)
    course_leaders = models.ManyToManyField(CourseLeader,
                                            related_name="ci_course_leaders")
    students = models.ManyToManyField(Student,
                                      through='CourseEnrollment')
    tutors = models.ManyToManyField(Tutor,
                                    related_name='ci_tutors')
    assignments = models.ManyToManyField(Assignment,
                                         through='AssignmentInstance')

    allow_late_submission = models.BooleanField(null=False,
                                                default=False)

    late_submission_penalty = models.DecimalField(decimal_places=3,
                                                  max_digits=6,
                                                  default=None,
                                                  null=True)

    point_step_size = models.DecimalField(decimal_places=3,
                                          max_digits=6,
                                          null=False,
                                          default=1)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['year', 'course'], name='course_instance_pk')
        ]

    def __str__(self):
        return f"{self.course} ({self.year})"
