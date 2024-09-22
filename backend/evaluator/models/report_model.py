from django.db import models

from user.models import User


class Report(models.Model):
    class Type(models.TextChoices):
        FEATURE = "FEATURE", "Feature"
        BUG = "BUG", "Bug"

    type = models.CharField(choices=Type,
                            null=False)
    title = models.CharField(max_length=255,
                             null=False)
    description = models.TextField(null=False)
    submitter = models.ForeignKey(User,
                                  on_delete=models.SET_NULL,
                                  null=True)
    gitlab_url = models.URLField(null=True)

    def __str__(self):
        return f"T{self.type}-Report: {self.title} ({self.submitter})"
