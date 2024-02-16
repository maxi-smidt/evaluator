from datetime import timedelta
from django.utils import timezone
from enum import Enum
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models


class UserManager(BaseUserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        if email:
            email = self.normalize_email(email)

        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        DPD = "DEGREE_PROGRAM_DIRECTOR", "Degree Program Director"
        CL = "COURSE_LEADER", "Course Leader"
        TUTOR = "TUTOR", "Tutor"

    base_role = Role.ADMIN

    role = models.CharField(max_length=50, choices=Role.choices)

    objects = UserManager()

    def save(self, *args, **kwargs):
        if not self.pk:
            self.role = self.base_role
            super().save(*args, **kwargs)


class CourseLeaderManager(BaseUserManager):
    def get_queryset(self, *args, **kwargs):
        return super().get_queryset(*args, **kwargs).filter(role=User.Role.CL)


class CourseLeader(User):
    base_role = User.Role.CL
    course_leader = CourseLeaderManager()

    class Meta:
        proxy = True


class DegreeProgramDirectorManager(BaseUserManager):
    def get_queryset(self, *args, **kwargs):
        return super().get_queryset(*args, **kwargs).filter(role=User.Role.DPD)


class DegreeProgramDirector(User):
    base_role = User.Role.DPD
    degree_program_director = DegreeProgramDirectorManager()

    class Meta:
        proxy = True


class TutorManager(BaseUserManager):
    def get_queryset(self, *args, **kwargs):
        return super().get_queryset(*args, **kwargs).filter(role=User.Role.TUTOR)


class Tutor(User):
    base_role = User.Role.TUTOR
    tutor = TutorManager()

    class Meta:
        proxy = True


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

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name', 'degree_program'], name='course_pk')
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
    tutor = models.ForeignKey(Student,
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
                                 max_digits=4,
                                 null=True)
    draft = models.JSONField(null=True)

    def __str__(self):
        return f"{self.student} - {self.assignment_instance} - {self.tutor} - {self.status}"
