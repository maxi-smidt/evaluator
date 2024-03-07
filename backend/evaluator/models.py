import json

from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.db import models
from enum import Enum
# noinspection PyUnresolvedReferences
from user.models import DegreeProgramDirector, CourseLeader, Tutor


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


class Assignment(models.Model):
    nr = models.IntegerField(null=False)
    name = models.CharField(max_length=50,
                            null=False)
    draft = models.JSONField(null=False)
    course = models.ForeignKey(Course,
                               on_delete=models.CASCADE,
                               null=False)
    points = models.IntegerField(null=False,
                                 default=100)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['nr', 'course'], name='assignment_pk')
        ]

    def __str__(self):
        return f"{self.name}"


class PreviousDeduction(models.Model):
    exercise_name = models.CharField(max_length=50,
                                     null=False)
    message = models.CharField(max_length=200,
                               null=False)
    points = models.DecimalField(decimal_places=2,
                                 max_digits=4)
    assignment = models.ForeignKey(Assignment,
                                   on_delete=models.CASCADE)


class ClassGroup(models.Model):
    start_year = models.IntegerField(null=False)
    degree_program = models.ForeignKey(DegreeProgram,
                                       on_delete=models.CASCADE)
    # TODO unique constraint

    def __str__(self):
        return f"{self.degree_program} ({self.start_year})"


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

    @property
    def full_name(self):
        return f"{self.last_name} {self.first_name}"

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.id})"


class CourseInstance(models.Model):
    year = models.IntegerField(null=False)
    course = models.ForeignKey(Course,
                               on_delete=models.CASCADE)
    course_leaders = models.ManyToManyField(CourseLeader,
                                            related_name="ci_course_leaders")
    students = models.ManyToManyField(Student,
                                      through='CourseEnrollment')
    tutors = models.ManyToManyField(Tutor,
                                    related_name='ci_tutors')
    assignments = models.ManyToManyField(Assignment,
                                         through='AssignmentInstance')

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['year', 'course'], name='course_instance_pk')
        ]

    def __str__(self):
        return f"{self.course} ({self.year})"


class CourseEnrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course_instance = models.ForeignKey(CourseInstance, on_delete=models.CASCADE)
    group = models.IntegerField(null=False, default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['student', 'course_instance'], name='course_enrollment_pk')
        ]

    def __str__(self):
        return f"{self.student} - {self.course_instance}"


class AssignmentInstance(models.Model):
    class Status(Enum):
        INACTIVE = "inactive"
        ACTIVE = "active"
        EXPIRED = "expired"

    assignment = models.ForeignKey(Assignment,
                                   on_delete=models.CASCADE)
    course_instance = models.ForeignKey(CourseInstance,
                                        on_delete=models.CASCADE,
                                        related_name="assignment_instances")
    due_to = models.DateTimeField()

    @property
    def status(self):
        if self.due_to <= timezone.now() <= self.due_to + timedelta(days=14):
            return self.Status.ACTIVE.name
        if timezone.now() > self.due_to + timedelta(days=14):
            return self.Status.EXPIRED.name
        return self.Status.INACTIVE.name

    class Meta:
        unique_together = ('assignment', 'course_instance')

    def save(self, *args, **kwargs):
        if self.assignment.course != self.course_instance.course:
            raise ValueError("Assignment must be related to the same course as the CourseInstance")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.assignment.name} - {self.course_instance.year}"


class Correction(models.Model):
    class Status(models.TextChoices):
        NOT_SUBMITTED = "NOT_SUBMITTED", "not submitted"
        CORRECTED = "CORRECTED", "corrected"
        IN_PROGRESS = "IN_PROGRESS", "in progress"
        UNDEFINED = "UNDEFINED", "undefined"

    student = models.ForeignKey(Student,
                                on_delete=models.SET_NULL,
                                null=True,
                                related_name="co_student")
    tutor = models.ForeignKey(Tutor,
                              on_delete=models.SET_NULL,
                              null=True,
                              related_name='co_tutor')
    assignment_instance = models.ForeignKey(AssignmentInstance,
                                            on_delete=models.SET_NULL,
                                            null=True,
                                            related_name="co_assignment_instance")
    expense = models.DurationField(null=True)
    status = models.CharField(max_length=50,
                              choices=Status,
                              null=False,
                              default=Status.UNDEFINED)
    points = models.DecimalField(decimal_places=2,
                                 max_digits=5,
                                 null=True)
    draft = models.JSONField(null=True)

    def __str__(self):
        return f"{self.student} - {self.assignment_instance} - {self.tutor} - {self.status}"


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
