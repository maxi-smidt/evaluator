from django.db import models

from .degree_program_model import DegreeProgram


class Course(models.Model):
    name = models.CharField(max_length=50)
    abbreviation = models.CharField(max_length=5,
                                    unique=True)
    degree_program = models.ForeignKey(DegreeProgram,
                                       on_delete=models.CASCADE)
    file_name = models.CharField(max_length=50)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name', 'degree_program'], name='course_pk'),
            models.CheckConstraint(
                check=models.Q(file_name__contains='{lastname}') & models.Q(file_name__contains='{nr}'),
                name='Course.filename Check'
            )
        ]

    def __str__(self):
        return f"{self.abbreviation} ({self.name})"
