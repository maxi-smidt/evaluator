from django.db import models

from .degree_program_model import DegreeProgram
from user.models import User


class UserDegreeProgram(models.Model):
    user = models.ForeignKey(User,
                             on_delete=models.CASCADE,
                             related_name='udp_user',
                             null=False)
    degree_program = models.ForeignKey(DegreeProgram,
                                       on_delete=models.CASCADE,
                                       related_name='udp_degree_program',
                                       null=False)

    class Meta:
        unique_together = ('user', 'degree_program')

    def __str__(self):
        return f"{self.degree_program} - {self.user}"
