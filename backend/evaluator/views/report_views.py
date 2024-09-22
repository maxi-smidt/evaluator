import json
import requests

from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED

from ..models import Report
from ..serializers.report_serializers import ReportSerializer
# noinspection PyUnresolvedReferences
from backend.settings import GITLAB_AUTH_TOKEN, GITLAB_POST_URL

class ReportCreateView(CreateAPIView):
    serializer_class = ReportSerializer
    queryset = Report.objects.all()

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save()

        issue_response = self.create_issue(report)
        self.modify_report(report, issue_response)

        return Response(status=HTTP_201_CREATED)

    @staticmethod
    def create_issue(report: Report):
        params = {
            'title': f'{report.get_type_display()}: {report.title}',
            'description': report.description,
        }
        r = requests.post(
            url=GITLAB_POST_URL,
            headers={"PRIVATE-TOKEN": GITLAB_AUTH_TOKEN},
            params=params,
        )
        return json.loads(r.text)

    @staticmethod
    def modify_report(report: Report, issue_response):
        report.gitlab_url = issue_response['web_url']
        report.save()

