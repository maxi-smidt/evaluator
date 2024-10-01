import os
import shutil
import subprocess
import zipfile
from datetime import datetime

from django.http import HttpResponse
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from ..models import Report
# noinspection PyUnresolvedReferences
from backend.settings import JPLAG_PATH


class JplagRetrieveView(GenericAPIView):
    TEMP_DIR = 'temp'

    def post(self, request, *args, **kwargs):
        success = True  # Track if the process is successful
        try:
            self.pre_conditions(request.user.id)
            file = request.data['zipfile']
            self.load_and_unzip(file)
            language = request.query_params.get('lang')

            if not self.jplag_is_installed():
                Report.objects.create(title='Internal', description='JPlag Error').save()
                success = False  # Set success to False
                return Response({'message': 'JPlag is not installed or the command failed.'}, status=500)

            subprocess.run(
                ['java', '-jar', os.path.join(JPLAG_PATH, 'jplag.jar'), '-l', language,
                 self.source_file_path, '-r', self.result_file_path],
                capture_output=True, text=True, check=True
            )

            if not os.path.exists(f'{self.result_file_path}.zip'):
                success = False
                return Response({'message': 'JPlag did not produce the expected output.'}, status=500)

            with open(f'{self.result_file_path}.zip', 'rb') as f:
                response = HttpResponse(f.read(), content_type='application/zip')
                response['Content-Disposition'] = f'attachment; filename=result.zip'
            return response
        except subprocess.CalledProcessError as e:
            success = False
            return Response({'message': e.output}, status=e.returncode)
        finally:
            if success:
                self.post_conditions()
            else:
                print("Process failed; skipping cleanup.")

    def load_and_unzip(self, file):
        content = file.read()
        with open(f'{self.source_file_path}.zip', 'wb') as f:
            f.write(content)

        with zipfile.ZipFile(f'{self.source_file_path}.zip', 'r') as zip_ref:
            zip_ref.extractall(f'{self.source_file_path}')

    def pre_conditions(self, user_id):
        file_name = f"{datetime.now().strftime('%d%m%Y%H%M%S')}_{user_id}"
        self.source_file_path = os.path.join(self.TEMP_DIR, file_name)
        self.result_file_path = os.path.join(self.TEMP_DIR, f'result_{file_name}')

    def post_conditions(self):
        os.remove(f'{self.source_file_path}.zip')
        shutil.rmtree(self.source_file_path)
        os.remove(f'{self.result_file_path}.zip')

    @staticmethod
    def jplag_is_installed() -> bool:
        jplag_path = os.path.join(JPLAG_PATH, 'jplag.jar')
        try:
            subprocess.run(['java', '-jar', jplag_path, '-h'], capture_output=True, text=True, check=True)
            return True
        except subprocess.CalledProcessError as e:
            return e.stderr == ''
