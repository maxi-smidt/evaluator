from rest_framework import status
from rest_framework.generics import CreateAPIView, DestroyAPIView
from rest_framework.response import Response

from ..models import CourseEnrollment
from ..serializers.course_enrollment_serializer import CourseEnrollmentSerializer
from user.permissions import IsDegreeProgramDirector


class CourseEnrollmentCreateView(CreateAPIView):
    permission_classes = [IsDegreeProgramDirector]
    serializer_class = CourseEnrollmentSerializer
    queryset = CourseEnrollment.objects.all()

    def create(self, request, *args, **kwargs):
        is_many = isinstance(request.data, list)
        serializer = self.get_serializer(data=request.data, many=is_many)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CourseEnrollmentDestroyView(DestroyAPIView):
    permission_classes = [IsDegreeProgramDirector]
    serializer_class = CourseEnrollmentSerializer
    queryset = CourseEnrollment.objects.all()

    def get_object(self):
        student_id = self.request.query_params.get('student_id')
        course_instance_id = self.request.query_params.get('course_instance_id')
        return CourseEnrollment.objects.get(student_id=student_id, course_instance_id=course_instance_id)