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
        filename = ai.assignment.course.file_name.format(lastname=student.last_name, nr="%02d" % ai.assignment.nr)
        response = HttpResponse(io.BytesIO(pdf), content_type='application/pdf')
        response['filename'] = f'{filename}'
        response['Access-Control-Expose-Headers'] = 'filename'
        return response
