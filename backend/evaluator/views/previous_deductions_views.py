from django.core.exceptions import PermissionDenied
from rest_framework.generics import RetrieveAPIView, get_object_or_404

from ..models import Correction, PreviousDeduction
from ..serializers.previous_deductions_serializers import PreviousDeductionsSerializer


class PreviousDeductionsRetrieveView(RetrieveAPIView):
    queryset = PreviousDeduction.objects.all()
    serializer_class = PreviousDeductionsSerializer

    def get_object(self):
        correction_id = self.kwargs.get(self.lookup_field)
        assignment_instance = Correction.objects.get(pk=correction_id).assignment_instance
        if not assignment_instance.course_instance.tutors.filter(username=self.request.user.username).exists():
            raise PermissionDenied
        return get_object_or_404(self.queryset, assignment_id=assignment_instance.assignment_id)
