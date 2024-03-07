import io
from django.http import HttpResponse
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView, RetrieveUpdateDestroyAPIView, \
    RetrieveUpdateAPIView
# noinspection PyUnresolvedReferences
from user.models import User, Tutor, CourseLeader, DegreeProgramDirector
from .models import Correction, DegreeProgram, AssignmentInstance, CourseInstance
from .utils.pdf_maker import PdfMaker
from . import serializers
# noinspection PyUnresolvedReferences
from user.permissions import IsDegreeProgramDirector, IsAdmin
# noinspection PyUnresolvedReferences
from user.serializers import DegreeProgramDirectorSerializer


class CourseInstanceListView(ListAPIView):
    serializer_class = serializers.CourseInstanceSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.TUTOR:
            tutor = Tutor.objects.get(pk=user.pk)
            return tutor.ci_tutors.all()
        else:
            raise ValueError("other roles not defined")


class CourseInstanceDetailView(RetrieveAPIView):
    serializer_class = serializers.DetailCourseInstanceSerializer
    lookup_field = 'course_id'

    def get_queryset(self):
        user = self.request.user
        course_id = self.kwargs.get(self.lookup_field)
        if user.role == User.Role.TUTOR:
            tutor = Tutor.objects.get(pk=user.id)
            return tutor.ci_tutors.filter(pk=course_id)
        else:
            raise PermissionDenied("You do not have permission to access this resource.")


class AssignmentInstanceDetailView(RetrieveAPIView):
    serializer_class = serializers.DetailAssignmentInstanceSerializer
    lookup_field = 'assignment_id'

    def get_queryset(self):
        user = self.request.user
        assignment_id = self.kwargs.get(self.lookup_field)
        if user.role == User.Role.TUTOR:
            cis = Tutor.objects.get(pk=user.id).ci_tutors.all()
            return AssignmentInstance.objects.filter(course_instance__in=cis, pk=assignment_id)
        else:
            raise PermissionDenied("You do not have permission to access this resource.")


class CorrectionDownloadRetrieveView(RetrieveAPIView):
    queryset = Correction.objects.all()

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj.status is not Correction.Status.CORRECTED:
            obj.status = Correction.Status.CORRECTED
            obj.save()
        pdf = PdfMaker(obj).make_pdf_stream()
        student = obj.student
        ai = obj.assignment_instance
        filename = ai.assignment.course.file_name.format(lastname=student.last_name, nr="%02d" % ai.assignment.nr)
        response = HttpResponse(io.BytesIO(pdf), content_type='application/pdf')
        response['filename'] = f'{filename}'
        response['Access-Control-Expose-Headers'] = 'filename'
        return response


class StudentGroupRetrieveUpdateView(RetrieveUpdateAPIView):
    serializer_class = serializers.CourseInstanceEnrollmentsSerializer
    queryset = CourseInstance.objects.all()


class TutorGroupRetrieveUpdateView(RetrieveUpdateAPIView):
    serializer_class = serializers.TutorCoursePartitionSerializer
    queryset = CourseInstance.objects.all()


class CorrectionCreateApiView(CreateAPIView):
    serializer_class = serializers.CorrectionSerializer
    queryset = Correction.objects.all()


class CorrectionRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.CorrectionSerializer
    queryset = Correction.objects.all()


class DegreeProgramDirectorListView(ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = DegreeProgramDirectorSerializer
    queryset = DegreeProgramDirector.objects.all()


class DegreeProgramCreateView(CreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = serializers.AdminDegreeProgramSerializer


class DegreeProgramListView(ListAPIView):
    def get_serializer_class(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return serializers.AdminDegreeProgramSerializer
        elif user.role == User.Role.DPD:
            return serializers.DegreeProgramSerializer
        else:
            raise PermissionDenied("You do not have permission to access this resource.")

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.DPD:
            return DegreeProgram.objects.filter(dp_director_id=user.id)
        elif user.role == User.Role.ADMIN:
            return DegreeProgram.objects.all()
        else:
            raise PermissionDenied("You do not have permission to access this resource.")
