from django.db import models

from .class_group_model import ClassGroup


class Student(models.Model):
    id = models.CharField(max_length=11,
                          primary_key=True)
    first_name = models.CharField(max_length=50,
                                  null=False)
    last_name = models.CharField(max_length=50,
                                 null=False)
    class_group = models.ForeignKey(ClassGroup,
                                    on_delete=models.SET_NULL,
                                    null=True)

    class Meta:
        ordering = ['id']

    @property
    def full_name(self):
        return f"{self.last_name} {self.first_name}"

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.id})"
