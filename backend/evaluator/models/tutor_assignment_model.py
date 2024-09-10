import json

from django.db import models

from .assignment_instance_model import AssignmentInstance
from user.models import Tutor


class TutorAssignment(models.Model):
    tutor = models.ForeignKey(Tutor,
                              on_delete=models.CASCADE,
                              related_name='tutor_assignments')
    assignment_instance = models.ForeignKey(AssignmentInstance,
                                            on_delete=models.CASCADE,
                                            related_name='tutor_assignments')
    _groups = models.TextField(default='[]')

    @property
    def groups(self):
        return json.loads(self._groups)

    @groups.setter
    def groups(self, value):
        if not all(isinstance(item, int) for item in value):
            raise ValueError("All items in the array must be integers")
        self._groups = json.dumps(value)

    def save(self, *args, **kwargs):
        if isinstance(self._groups, list):
            self._groups = json.dumps(self._groups)
        super(TutorAssignment, self).save(*args, **kwargs)

    class Meta:
        unique_together = ('tutor', 'assignment_instance')

    def __str__(self):
        return f"Tutor: {self.tutor}, Assignment: {self.assignment_instance}, Group: {self.groups}"
