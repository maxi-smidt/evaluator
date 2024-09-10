from rest_framework.generics import CreateAPIView

from ..models import Report
from ..serializers.report_serializers import ReportSerializer


class ReportCreateView(CreateAPIView):
    serializer_class = ReportSerializer
    queryset = Report.objects.all()
