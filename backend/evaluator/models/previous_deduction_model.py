from django.db import models

from .assignment_model import Assignment


class PreviousDeduction(models.Model):
    assignment = models.OneToOneField(Assignment, on_delete=models.CASCADE)
    draft = models.JSONField(null=True)
