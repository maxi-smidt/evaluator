from django.urls import path
from rest_framework.permissions import AllowAny

from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('token/', TokenObtainPairView.as_view(permission_classes=[AllowAny]), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(permission_classes=[AllowAny]), name='token_refresh'),
    path('can-activate/', views.can_activate, name='can_activate'),
    path('get-user/', views.get_user, name='get_user'),
    path('get-courses/', views.get_courses, name='get_courses'),
    path('get-exercises/', views.get_exercises_by_course, name="get_exercises_by_course_id"),
    path('get-assignment/', views.get_assignment, name="get_assignment_by_id"),
    path('students-course-group/', views.set_or_get_student_course_group, name="set_or_get_students_course_group"),
    path('set-correction-state/', views.set_correction_state, name="set_correction_not_submitted"),
    path('delete-correction/', views.delete_correction, name="delete_correction"),
    path('get-correction/', views.get_correction, name="get_correction"),
    path('save-correction/', views.save_correction, name="save_correction"),
    path('download-correction/', views.download_correction, name="download_correction"),
    path('get-course-partition/', views.get_course_partition, name="get_course_partition"),
    path('set-course-partition/', views.set_course_partition, name="set_course_partition"),
    path('register-user/', views.register_user, name="register_user"),
    path('all-users/', views.all_users, name="all_users"),
    path('change-user-activity-state/', views.change_user_activity_state, name="change_user_activity_state"),
    path('get-degree-program-directors/', views.get_degree_program_directors, name="get_degree_program_directors"),
    path('register-degree-program/', views.register_degree_program, name="register_degree_program"),
    path('get-degree-programs/', views.get_degree_programs, name="get_degree_programs")
]
