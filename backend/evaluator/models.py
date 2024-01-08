from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save
from rest_framework.authtoken.models import Token


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


class Student(models.Model):
    s_number = models.CharField(max_length=11, primary_key=True)
    firstname = models.CharField(max_length=25)
    lastname = models.CharField(max_length=25)

    def __str__(self):
        return f'({self.s_number}) - {self.firstname} {self.lastname}'


class TutorManager(BaseUserManager):
    def create_user(self, s_number, password, **extra_fields):
        if not s_number:
            raise ValueError('The S-Number must be set')
        student = Student.objects.get(s_number=s_number)
        user = self.model(s_number=s_number, student=student, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, s_number, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(s_number, password, **extra_fields)


class Tutor(AbstractBaseUser, PermissionsMixin):
    student = models.OneToOneField(Student, on_delete=models.CASCADE)
    s_number = models.CharField(max_length=11, unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = TutorManager()

    USERNAME_FIELD = 's_number'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f'{self.student} (Tutor)'


class Course(models.Model):
    name = models.CharField(max_length=10)

    def __str__(self):
        return f'{self.name}'


class Exercise(models.Model):
    name = models.CharField(max_length=30)
    draft = models.JSONField()

    def __str__(self):
        return f'{self.name}'


class TutorCourse(models.Model):
    tutor = models.ForeignKey(Tutor, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.tutor} - {self.course}'


class StudentCourse(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    group = models.IntegerField(default=0)

    def __str__(self):
        return f'{self.student} - {self.course}'


class CourseExercise(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.course} - {self.exercise}'

