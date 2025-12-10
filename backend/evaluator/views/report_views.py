import base64

from github import GithubIntegration, Auth
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED

from ..models import Report
from ..serializers.report_serializers import ReportSerializer
# noinspection PyUnresolvedReferences
from backend.settings import GITHUB_PRIVATE_KEY_BASE64, GITHUB_INSTALLATION_ID, GITHUB_APP_ID

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
        auth = Auth.AppAuth(
            app_id=GITHUB_APP_ID,
            private_key=base64.b64decode(GITHUB_PRIVATE_KEY_BASE64).decode('utf-8'),
        )
        gi = GithubIntegration(auth=auth)
        g = gi.get_github_for_installation(int(GITHUB_INSTALLATION_ID))
        repo = g.get_repo('maxi-smidt/evaluator')
        issue = repo.create_issue(
            title=f'{report.get_type_display()}: {report.title}',
            body=report.description,
            labels=['reported']
        )
        return issue.html_url

    @staticmethod
    def modify_report(report: Report, url: str):
        report.gitlab_url = url
        report.save()

