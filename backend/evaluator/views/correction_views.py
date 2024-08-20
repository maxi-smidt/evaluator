import io

from django.http import HttpResponse
from rest_framework.generics import RetrieveAPIView, CreateAPIView, RetrieveUpdateDestroyAPIView

from ..serializers import correction_serializers
from ..models import Correction
from ..utils.pdf_maker import PdfMaker


class CorrectionCreateView(CreateAPIView):
    serializer_class = correction_serializers.CorrectionSerializer
    queryset = Correction.objects.all()


class CorrectionRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class = correction_serializers.CorrectionSerializer
    queryset = Correction.objects.all()


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
