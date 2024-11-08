import io

from django.http import HttpResponse
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import RetrieveAPIView, CreateAPIView, RetrieveUpdateDestroyAPIView

from ..serializers import correction_serializers
from ..models import Correction
from ..utils.pdf_maker import PdfMaker
from user.permissions import IsTutor


class CorrectionCreateView(CreateAPIView):
    serializer_class = correction_serializers.CorrectionSerializer
    queryset = Correction.objects.all()


class CorrectionRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsTutor]
    serializer_class = correction_serializers.CorrectionSerializer
    queryset = Correction.objects.all()

    def get_queryset(self):
        user = self.request.user
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return Correction.objects.filter(tutor_id=user.id)

        correction = Correction.objects.get(pk=self.kwargs['pk'])
        course_instance = correction.assignment_instance.course_instance
        if not course_instance.tutors.filter(id=user.id).exists():
            raise PermissionDenied()
        return Correction.objects.filter(assignment_instance__course_instance=course_instance)

# TODO error message when edit redirect to a correction that is not yours


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
        filename = self.__make_file_name(ai.course_instance.file_name, obj, ai.assignment, student)
        response = HttpResponse(io.BytesIO(pdf), content_type='application/pdf')
        response['filename'] = f'{filename}'
        response['Access-Control-Expose-Headers'] = 'filename'
        return response

    @staticmethod
    def __make_file_name(template, correction, assignment, student):
        points = f"{correction.points:.10g}".replace('.', '_') if correction.points % 1 != 0 else str(int(correction.points))
        lastname = student.last_name
        firstname = student.first_name
        nr = f"{assignment.nr:02}"
        return template.format(lastname=lastname, nr=nr, firstname=firstname, points=points)
