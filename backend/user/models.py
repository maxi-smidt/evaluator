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

    @property
    def full_name(self):
        return f"{self.last_name} {self.first_name}"

    def save(self, *args, **kwargs):
        if not self.pk:
            self.role = self.base_role
        super().save(*args, **kwargs)


class CourseLeaderManager(BaseUserManager):
    def get_queryset(self, *args, **kwargs):
        return super().get_queryset(*args, **kwargs).filter(role=User.Role.CL, is_active=True)


class CourseLeader(User):
    base_role = User.Role.CL
    objects = CourseLeaderManager()

    class Meta:
        proxy = True


class DegreeProgramDirectorManager(BaseUserManager):
    def get_queryset(self, *args, **kwargs):
        return super().get_queryset(*args, **kwargs).filter(role=User.Role.DPD, is_active=True)


class DegreeProgramDirector(User):
    base_role = User.Role.DPD
    objects = DegreeProgramDirectorManager()

    class Meta:
        proxy = True


class TutorManager(BaseUserManager):
    def get_queryset(self, *args, **kwargs):
        return super().get_queryset(*args, **kwargs).filter(role=User.Role.TUTOR, is_active=True)


class Tutor(User):
    base_role = User.Role.TUTOR
    objects = TutorManager()

    class Meta:
        proxy = True
