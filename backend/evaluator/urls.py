from django.urls import path
from . import views


urlpatterns = [
    path('courses/', views.CourseInstanceListView.as_view(), name='courses'),
    path('course/<int:course_id>/', views.CourseInstanceDetailView.as_view(), name="course"),
    path('assignment/<int:assignment_id>/', views.AssignmentInstanceDetailView.as_view(), name="assignment"),
    path('correction/create/', views.CorrectionCreateApiView.as_view(), name="correction_create"),
    path('correction/<int:pk>/', views.CorrectionRetrieveUpdateDestroyView.as_view(), name="correction"),
    path('correction/download/<int:pk>/', views.CorrectionDownloadRetrieveView.as_view(), name="correction_download"),
    path('student-group/<int:pk>/', views.StudentGroupRetrieveUpdateView.as_view(), name="student_group"),
    path('get-course-partition/', views.get_course_partition, name="get_course_partition"),
    path('set-course-partition/', views.set_course_partition, name="set_course_partition"),
    path('degree-program/create/', views.DegreeProgramCreateView.as_view(), name="register_degree_program"),
    path('degree-programs/', views.DegreeProgramListView.as_view(), name="degree_programs")
]
