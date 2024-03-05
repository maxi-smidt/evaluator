import io
import json
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView, RetrieveUpdateDestroyAPIView
# noinspection PyUnresolvedReferences
from user.models import User, Tutor, CourseLeader, DegreeProgramDirector
from .models import Correction, CourseEnrollment, TutorAssignment, DegreeProgram, AssignmentInstance
from .utils.pdf_maker import PdfMaker
from .utils.utils_course import (get_students_of_course_by_group, set_groups_students_of_course,
                                 set_tutor_course_partition)
from .serializers import (DegreeProgramSerializer, CourseInstanceSerializer, DetailCourseInstanceSerializer,
                          DetailAssignmentInstanceSerializer, AdminDegreeProgramSerializer, CorrectionSerializer)
# noinspection PyUnresolvedReferences
from user.permissions import IsDegreeProgramDirector, IsAdmin
# noinspection PyUnresolvedReferences
from user.serializers import DegreeProgramDirectorSerializer


class CourseInstanceListView(ListAPIView):
    serializer_class = CourseInstanceSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.TUTOR:
            tutor = Tutor.objects.get(pk=user.pk)
            return tutor.ci_tutors.all()
        else:
            raise ValueError("other roles not defined")


class CourseInstanceDetailView(RetrieveAPIView):
    serializer_class = DetailCourseInstanceSerializer
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
    serializer_class = DetailAssignmentInstanceSerializer
    lookup_field = 'assignment_id'

    def get_queryset(self):
        user = self.request.user
        assignment_id = self.kwargs.get(self.lookup_field)
        if user.role == User.Role.TUTOR:
            cis = Tutor.objects.get(pk=user.id).ci_tutors.all()
            return AssignmentInstance.objects.filter(course_instance__in=cis, pk=assignment_id)
        else:
            raise PermissionDenied("You do not have permission to access this resource.")


@api_view(['GET', 'POST'])
def set_or_get_student_course_group(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    course_id = request.GET.get('course_id') or request.data.get('course_id')
    ci = get_object_or_404(tutor.ci_tutors, pk=course_id)
    if request.method == 'POST':
        set_groups_students_of_course(ci, request.data['students'])
    students = get_students_of_course_by_group(ci)
    return HttpResponse(json.dumps(students), content_type='application/json')


@api_view(['POST'])
def download_correction(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = get_object_or_404(tutor.ci_tutors, pk=request.data['course_id'])
    student = get_object_or_404(ci.students, pk=request.data['student_id'])
    ai = get_object_or_404(ci.assignment_instances, pk=request.data['assignment_id'])
    corr = get_object_or_404(Correction, student=student, assignment_instance=ai, tutor=tutor)
    if corr.status is not Correction.Status.CORRECTED:
        corr.status = Correction.Status.CORRECTED
        corr.save()
    pdf = PdfMaker(corr).make_pdf_stream()
    filename = corr.assignment_instance.assignment.course.file_name.format(lastname=student.last_name,
                                                                           nr="%02d" % ai.assignment.nr)
    response = HttpResponse(io.BytesIO(pdf), content_type='application/pdf')
    response['filename'] = f'{filename}'
    response['Access-Control-Expose-Headers'] = 'filename'
    return response


@api_view(['GET'])
def get_course_partition(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = get_object_or_404(tutor.ci_tutors, pk=request.GET.get('course_id'))
    group_selection = list(CourseEnrollment.objects.filter(course_instance=ci).exclude(group=-1)
                           .values_list('group', flat=True).distinct())
    partition = []
    for tutor in ci.tutors.all():
        for assignment in ci.assignment_instances.all():
            try:
                groups = TutorAssignment.objects.get(tutor=tutor, assignment_instance=assignment).groups
            except TutorAssignment.DoesNotExist:
                groups = []
            partition.append({
                'tutor': {'name': tutor.full_name, 'id': tutor.id},
                'assignment': {'name': assignment.assignment.name, 'id': assignment.id},
                'groups': sorted(groups)
            })
    response = {'partition': partition, 'groups': sorted(group_selection)}
    return HttpResponse(json.dumps(response, default=str), content_type='application/json')


@api_view(['POST'])
def set_course_partition(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = get_object_or_404(tutor.ci_tutors, pk=request.data['course_id'])
    set_tutor_course_partition(ci, request.data['partition'])
    return HttpResponse()


class CorrectionCreateApiView(CreateAPIView):
    serializer_class = CorrectionSerializer
    queryset = Correction.objects.all()


class CorrectionRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class = CorrectionSerializer
    queryset = Correction.objects.all()


class DegreeProgramDirectorListView(ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = DegreeProgramDirectorSerializer
    queryset = DegreeProgramDirector.objects.all()


class DegreeProgramCreateView(CreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminDegreeProgramSerializer


class DegreeProgramListView(ListAPIView):
    def get_serializer_class(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return AdminDegreeProgramSerializer
        elif user.role == User.Role.DPD:
            return DegreeProgramSerializer
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
