from django.db import models

from .degree_program_model import DegreeProgram


class ClassGroup(models.Model):
    start_year = models.IntegerField(null=False)
    degree_program = models.ForeignKey(DegreeProgram,
                                       on_delete=models.CASCADE)

    class Meta:
        unique_together = ('start_year', 'degree_program',)

    def __str__(self):
        return f"{self.degree_program} ({self.start_year})"