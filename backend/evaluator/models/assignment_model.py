from django.db import models
from jsonschema import validate

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

    draft_schema = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "distribution": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "points": {"type": "number"},
                        }
                    }
                },
            }
        },
    }

    @property
    def points(self):
        sum_points = 0
        for exercise in self.draft:
            for sub_exercise in exercise['distribution']:
                sum_points += sub_exercise['points']
        return sum_points

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['nr', 'course'], name='assignment_pk')
        ]
        ordering = ['nr']

    def save(self, *args, **kwargs):
        validate(self.draft, self.draft_schema)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}"
