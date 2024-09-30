from django.urls import path
from .views import course_views as cv, report_views as rv, degree_program_views as dpv, jplag_views as jv, \
    correction_views as cov, assignment_views as av, basic_views as bv, previous_deductions_views as pdv, \
    student_views as sv, course_enrollment_views as cev


urlpatterns = [
    path('health/', bv.health_check, name='health'),
    path('course/create/', cv.CourseCreateView.as_view(), name='course_create'),
    path('courses/', cv.CourseListView.as_view(), name='courses'),
    path('course/<int:pk>/', cv.CourseRetrieveUpdateView.as_view(), name='course'),
    path('course-instance/create/', cv.CourseInstanceCreateView.as_view(), name='course_instance_create'),
    path('course-instances/', cv.CourseInstanceListView.as_view(), name='course_instances'),
    path('course-instance/<int:pk>/', cv.CourseInstanceRetrieveUpdateDestroyView.as_view(), name="course_instance"),
    path('course-partition/<int:pk>/', bv.TutorGroupRetrieveUpdateView.as_view(), name="course_partition"),
    path('course-chart/<int:pk>/', bv.CourseInstanceChartRetrieveView.as_view(), name="course_chart"),
    path('assignment/create/', av.AssignmentCreateView.as_view(), name='assignment_create'),
    path('assignment/<int:pk>/', av.AssignmentRetrieveUpdateDestroyView.as_view(), name="assignment"),
    path('assignment-instance/<int:pk>/', av.AssignmentInstanceDetailView.as_view(), name="assignment-instance"),
    path('correction/create/', cov.CorrectionCreateView.as_view(), name="correction_create"),
    path('correction/<int:pk>/', cov.CorrectionRetrieveUpdateDestroyView.as_view(), name="correction"),
    path('correction/download/<int:pk>/', cov.CorrectionDownloadRetrieveView.as_view(), name="correction_download"),
    path('student-group/<int:pk>/', bv.StudentGroupRetrieveUpdateView.as_view(), name="student_group"),
    path('degree-program/create/', dpv.DegreeProgramCreateView.as_view(), name="degree_program_create"),
    path('degree-program/<str:abbreviation>/', dpv.DegreeProgramRetrieveView.as_view(), name="degree_program"),
    path('degree-programs/', dpv.DegreeProgramListView.as_view(), name="degree_programs"),
    path('report/', rv.ReportCreateView.as_view(), name="report"),
    path('jplag/', jv.JplagRetrieveView.as_view(), name="jplag"),
    path('user-degree-program/create/', dpv.UserDegreeProgramCreateView.as_view(), name="user_degree_program_create"),
    path('user-degree-program/<str:username>&<str:abbreviation>/', dpv.UserDegreeProgramDeleteView.as_view(), name="user_degree_program_delete"),
    path('deductions/create/', pdv.PreviousDeductionsCreateView.as_view(), name="deduction_create"),
    path('deductions/<int:pk>/', pdv.PreviousDeductionsRetrieveView.as_view(), name="deduction"),
    path('class-groups/<str:abbreviation>/', dpv.ClassGroupListView.as_view(), name="class_groups"),
    path('class-group/create/', dpv.ClassGroupCreateView.as_view(), name="class_group_create"),
    path('class-group/<int:pk>/', dpv.ClassGroupRetrieveView.as_view(), name="class_group"),
    path('student/create/', sv.StudentCreateView.as_view(), name="student_create"),
    path('student/<str:pk>/', sv.StudentRetrieveUpdateDestroyView.as_view(), name="student"),
    path('students/', sv.StudentListView.as_view(), name="student_list"),
    path('course_enrollment/create/', cev.CourseEnrollmentCreateView.as_view(), name="course_enrollment_create" ),
    path('course_enrollment/', cev.CourseEnrollmentDestroyView.as_view(), name="course_enrollment" ),
]
