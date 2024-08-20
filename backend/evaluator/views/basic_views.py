from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import RetrieveAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..models import CourseInstance
from ..serializers import course_serializers


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check():
    return Response({"message": "Server is up and running"})


class StudentGroupRetrieveUpdateView(RetrieveUpdateAPIView):
    serializer_class = course_serializers.CourseInstanceEnrollmentsSerializer
    queryset = CourseInstance.objects.all()


class TutorGroupRetrieveUpdateView(RetrieveUpdateAPIView):
    serializer_class = course_serializers.TutorCoursePartitionSerializer
    queryset = CourseInstance.objects.all()


class CourseInstanceChartRetrieveView(RetrieveAPIView):
    serializer_class = course_serializers.CourseInstanceChartSerializer
    queryset = CourseInstance.objects.all()
