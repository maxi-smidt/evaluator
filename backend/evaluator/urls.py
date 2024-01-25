from django.urls import path, re_path
from django.views.generic import RedirectView
from . import views
from .views import CustomTokenObtainPairView

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('can-activate/', views.can_activate, name='can_activate'),
    path('can-activate-superuser/', views.can_activate_superuser, name='can_activate_superuser'),
    path('get-user/', views.get_user, name='get_user'),
    path('get-courses/', views.get_courses, name='get_courses'),
    path('get-exercises/', views.get_exercises_by_course, name="get_exercises_by_course_id"),
    path('get-exercise/', views.get_exercise, name="get_exercise_by_id"),
    path('get-students/', views.get_students, name="get_students_of_course_by_group"),
    path('set-students-course-group/', views.set_student_course_group, name="set_students_course_group")
]
