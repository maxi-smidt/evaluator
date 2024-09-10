from django.db import models

from user.models import DegreeProgramDirector


class DegreeProgram(models.Model):
    name = models.CharField(max_length=50,
                            primary_key=True)
    abbreviation = models.CharField(max_length=5,
                                    unique=True)
    dp_director = models.ForeignKey(DegreeProgramDirector,
                                    on_delete=models.SET_NULL,
                                    null=True)

    def __str__(self):
        return f"{self.abbreviation} ({self.dp_director})"
