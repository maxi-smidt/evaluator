from django.urls import path
from . import views
from .views import (DegreeProgramListView, CourseInstanceListView, CourseInstanceDetailView,
                    AssignmentInstanceDetailView, DegreeProgramCreateView, CorrectionRetrieveUpdateDestroyView, CorrectionCreateApiView)


urlpatterns = [
    path('courses/', CourseInstanceListView.as_view(), name='courses'),
    path('course/<int:course_id>/', CourseInstanceDetailView.as_view(), name="course"),
    path('assignment/<int:assignment_id>/', AssignmentInstanceDetailView.as_view(), name="assignment"),
    path('correction/create/', CorrectionCreateApiView.as_view(), name="correction_create"),
    path('correction/<int:pk>/', CorrectionRetrieveUpdateDestroyView.as_view(), name="correction"),
    path('students-course-group/', views.set_or_get_student_course_group, name="set_or_get_students_course_group"),
    path('download-correction/', views.download_correction, name="download_correction"),
    path('get-course-partition/', views.get_course_partition, name="get_course_partition"),
    path('set-course-partition/', views.set_course_partition, name="set_course_partition"),
    path('degree-program/create/', DegreeProgramCreateView.as_view(), name="register_degree_program"),
    path('degree-programs/', DegreeProgramListView.as_view(), name="degree_programs")
]
