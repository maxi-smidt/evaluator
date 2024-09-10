from django.db import models

from .course_model import Course


class Assignment(models.Model):
    nr = models.IntegerField(null=False)
    name = models.CharField(max_length=50,
                            null=False)
    draft = models.JSONField(null=False,
                             default=list)
    course = models.ForeignKey(Course,
                               on_delete=models.CASCADE,
                               null=False)
    points = models.IntegerField(null=False,
                                 default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['nr', 'course'], name='assignment_pk')
        ]

    def __str__(self):
        return f"{self.name}"
