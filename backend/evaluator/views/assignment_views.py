from rest_framework.generics import RetrieveUpdateDestroyAPIView, CreateAPIView, RetrieveDestroyAPIView

from user.models import User, Tutor
from user.permissions import IsDpdOrCl
from ..models import AssignmentInstance, Assignment
from ..serializers import assignment_serializers


class AssignmentInstanceDetailView(RetrieveDestroyAPIView):
    serializer_class = assignment_serializers.DetailAssignmentInstanceSerializer

    def get_queryset(self):
        user = self.request.user
        assignment_id = self.kwargs.get(self.lookup_field)
        if user.role == User.Role.TUTOR:
            cis = Tutor.objects.get(id=user.id).ci_tutors.all()
            return AssignmentInstance.objects.filter(course_instance__in=cis, pk=assignment_id)
        return AssignmentInstance.objects.all()


class AssignmentRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class = assignment_serializers.AssignmentSerializer
    queryset = Assignment.objects.all()
    permission_classes = [IsDpdOrCl]


class AssignmentCreateView(CreateAPIView):
    serializer_class = assignment_serializers.CreateAssignmentSerializer
    queryset = Assignment.objects.all()
    permission_classes = [IsDpdOrCl]
