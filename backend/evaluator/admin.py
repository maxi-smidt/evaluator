from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from .models import (Student,
                     Tutor,
                     Course,
                     Exercise,
                     TutorCourse,
                     StudentCourse,
                     CourseExercise,
                     Correction)


class TutorChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = Tutor


class TutorCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = Tutor
        fields = ('student',)


class TutorAdmin(UserAdmin):
    form = TutorChangeForm
    add_form = TutorCreationForm
    model = Tutor
    list_display = ('get_s_number', 'is_staff', 'is_active',)
    list_filter = ('is_staff', 'is_active',)
    fieldsets = (
        (None, {'fields': ('student', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('student', 'password1', 'password2', 'is_staff', 'is_active')}
         ),
    )
    search_fields = ('student__s_number',)
    ordering = ('student__s_number',)

    def get_s_number(self, obj):
        return obj.student.s_number

    get_s_number.admin_order_field = 'student__s_number'  # Allows column order sorting
    get_s_number.short_description = 'S-Number'  # Renames column head

    def save_model(self, request, obj, form, change):
        if not change:  # Only set s_number when creating a new object
            obj.s_number = obj.student.s_number
        super().save_model(request, obj, form, change)


admin.site.register(Student)
admin.site.register(Tutor, TutorAdmin)
admin.site.register(Course)
admin.site.register(Exercise)
admin.site.register(TutorCourse)
admin.site.register(StudentCourse)
admin.site.register(CourseExercise)
admin.site.register(Correction)
