from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User


class BaseUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = '__all__'

    def clean_password(self):
        return self.initial["password"]


class BaseUserCreationForm(UserCreationForm):
    role = User.Role.ADMIN

    class Meta(UserCreationForm.Meta):
        model = User
        fields = UserCreationForm.Meta.fields + ('email',)

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = self.role
        if commit:
            user.save()
        return user


class DegreeProgramDirectorCreationForm(BaseUserCreationForm):
    role = User.Role.DPD

    def save(self, commit=True):
        return super().save(commit=commit)


class CourseLeaderCreationForm(BaseUserCreationForm):
    role = User.Role.CL

    def save(self, commit=True):
        return super().save(commit=commit)


class TutorCreationForm(BaseUserCreationForm):
    role = User.Role.TUTOR

    def save(self, commit=True, **kwargs):
        return super().save(commit=commit)
