from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .forms import (BaseUserChangeForm,
                    TutorCreationForm,
                    DegreeProgramDirectorCreationForm,
                    CourseLeaderCreationForm)
from .models import (User,
                     CourseLeader,
                     DegreeProgramDirector,
                     Tutor,
                     DegreeProgram,
                     Course,
                     Assignment,
                     PreviousDeduction,
                     ClassGroup,
                     Student,
                     CourseInstance,
                     Correction,
                     AssignmentInstance,
                     CourseEnrollment)


class TutorAdmin(UserAdmin):
    add_form = TutorCreationForm
    form = BaseUserChangeForm
    model = Tutor


class DegreeProgramDirectorAdmin(UserAdmin):
    add_form = DegreeProgramDirectorCreationForm
    form = BaseUserChangeForm
    model = DegreeProgramDirector


class CourseLeaderAdmin(UserAdmin):
    add_form = CourseLeaderCreationForm
    form = BaseUserChangeForm
    model = CourseLeader


admin.site.register(User)
admin.site.register(CourseLeader, CourseLeaderAdmin)
admin.site.register(DegreeProgramDirector, DegreeProgramDirectorAdmin)
admin.site.register(Tutor, TutorAdmin)
admin.site.register(DegreeProgram)
admin.site.register(Course)
admin.site.register(Assignment)
admin.site.register(PreviousDeduction)
admin.site.register(ClassGroup)
admin.site.register(Student)
admin.site.register(CourseInstance)
admin.site.register(Correction)
admin.site.register(AssignmentInstance)
admin.site.register(CourseEnrollment)
