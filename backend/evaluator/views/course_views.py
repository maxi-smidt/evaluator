from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView, CreateAPIView, RetrieveUpdateDestroyAPIView

from user.models import User, Tutor
from user.permissions import IsDegreeProgramDirector, IsDpdOrCl
from ..models import Course, CourseInstance
from ..serializers import course_serializers


class CourseInstanceListView(ListAPIView):
    serializer_class = course_serializers.SimpleCourseInstanceSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.TUTOR:
            return Tutor.objects.get(id=user.id).ci_tutors.all()
        elif user.role == User.Role.DPD:
            abbreviation = self.request.query_params.get('dp')
            return (CourseInstance.objects.filter(course__degree_program__abbreviation=abbreviation)
                    .order_by('course__name', '-year'))
        else:
            raise PermissionDenied("other roles not defined")


class CourseInstanceRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    def get_serializer_class(self):
        level = self.request.query_params.get('level')
        if level == 'simple':
            return course_serializers.SimpleCourseInstanceSerializer
        if level == 'detail':
            return course_serializers.DetailCourseInstanceSerializer
        if level == 'staff':
            return course_serializers.StaffCourseInstanceSerializer
        if level == 'due_date':
            return course_serializers.DueDatesCourseInstanceSerializer
        return course_serializers.CourseInstanceSerializer

    def get_queryset(self):
        user = self.request.user
        course_id = self.kwargs.get(self.lookup_field)
        if user.role == User.Role.TUTOR:
            tutor = Tutor.objects.get(id=user.id)
            return tutor.ci_tutors.filter(pk=course_id)
        elif user.role in [User.Role.DPD, User.Role.CL]:
            return CourseInstance.objects.filter(pk=course_id)
        else:
            raise PermissionDenied("You do not have permission to access this resource.")


class CourseCreateView(CreateAPIView):
    serializer_class = course_serializers.CourseSerializer
    queryset = Course.objects.all()
    permission_classes = [IsDegreeProgramDirector]


class CourseListView(ListAPIView):
    serializer_class = course_serializers.SimpleCourseSerializer
    permission_classes = [IsDegreeProgramDirector]

    def get_queryset(self):
        dp_abbreviation = self.request.query_params.get('dp')
        return Course.objects.filter(degree_program__abbreviation=dp_abbreviation).order_by('name')


class CourseInstanceCreateView(CreateAPIView):
    permission_classes = [IsDegreeProgramDirector]
    serializer_class = course_serializers.CourseInstanceCreateSerializer
    queryset = CourseInstance.objects.all()


class CourseRetrieveUpdateView(RetrieveUpdateAPIView):
    permission_classes = [IsDegreeProgramDirector]
    serializer_class = course_serializers.DetailCourseSerializer
    queryset = Course.objects.all()
