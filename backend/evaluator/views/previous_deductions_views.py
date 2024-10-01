from django.core.exceptions import PermissionDenied
from rest_framework.generics import get_object_or_404, CreateAPIView, RetrieveUpdateAPIView

from user.permissions import IsDpdOrCl
from ..models import Correction, PreviousDeduction
from ..serializers.previous_deductions_serializers import PreviousDeductionsSerializer, PreviousDeductionsCreateSerializer


class PreviousDeductionsRetrieveView(RetrieveUpdateAPIView):
    queryset = PreviousDeduction.objects.all()
    serializer_class = PreviousDeductionsSerializer

    def get_object(self):
        id_value = self.kwargs.get(self.lookup_field)
        assignment_id = None
        if self.request.query_params.get('id_type') == 'correction':
            assignment_instance = Correction.objects.get(pk=id_value).assignment_instance
            if not assignment_instance.course_instance.tutors.filter(username=self.request.user.username).exists():
                raise PermissionDenied
            assignment_id = assignment_instance.assignment_id
        if self.request.query_params.get('id_type') == 'assignment':
            if not IsDpdOrCl().has_permission(self.request, self):
                raise PermissionDenied
            assignment_id = id_value
        return get_object_or_404(self.queryset, assignment_id=assignment_id)


class PreviousDeductionsCreateView(CreateAPIView):
    queryset = PreviousDeduction.objects.all()
    serializer_class = PreviousDeductionsCreateSerializer
