from rest_framework.generics import RetrieveUpdateDestroyAPIView, CreateAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework import status

from ..models import Student
from ..serializers.student_serializers import StudentClassGroupSerializer
from user.permissions import IsDegreeProgramDirector


class StudentRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsDegreeProgramDirector]
    serializer_class = StudentClassGroupSerializer
    queryset = Student.objects.all()


class StudentCreateView(CreateAPIView):
    permission_classes = [IsDegreeProgramDirector]
    serializer_class = StudentClassGroupSerializer
    queryset = Student.objects.all()

    def create(self, request, *args, **kwargs):
        is_many = isinstance(request.data, list)
        serializer = self.get_serializer(data=request.data, many=is_many)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StudentListView(ListAPIView):
    permission_classes = [IsDegreeProgramDirector]
    serializer_class = StudentClassGroupSerializer
    queryset = Student.objects.all()

    def get_queryset(self):
        if abbreviation := self.request.query_params.get('abbreviation'):
            return Student.objects.filter(class_group__degree_program__abbreviation=abbreviation)
        if ids := self.request.query_params.get('ids'):
            class_group_ids = ids.split(',') if ids else []
            return Student.objects.filter(class_group__id__in=class_group_ids)
        if course_instance_id := self.request.query_params.get('course_instance_id'):
            return Student.objects.filter(courseenrollment__course_instance_id=course_instance_id)
