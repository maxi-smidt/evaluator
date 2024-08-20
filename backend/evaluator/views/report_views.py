from rest_framework.generics import CreateAPIView

from ..models import Report
from ..serializers import report_serializer


class ReportCreateView(CreateAPIView):
    serializer_class = report_serializer.ReportSerializer
    queryset = Report.objects.all()
