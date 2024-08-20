from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView, CreateAPIView, get_object_or_404, RetrieveAPIView, DestroyAPIView
from rest_framework.response import Response

from ..models import DegreeProgram, UserDegreeProgram
# noinspection PyUnresolvedReferences
from user.models import User
# noinspection PyUnresolvedReferences
from user.permissions import IsAdmin, IsDpdOrAdmin, IsDegreeProgramDirector
from ..serializers import degree_program_serializers


class DegreeProgramListView(ListAPIView):
    def get_serializer_class(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return degree_program_serializers.AdminDegreeProgramSerializer
        elif user.role == User.Role.DPD:
            return degree_program_serializers.DegreeProgramSerializer
        else:
            raise PermissionDenied("You do not have permission to access this resource.")

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.DPD:
            return DegreeProgram.objects.filter(dp_director_id=user.id)
        elif user.role == User.Role.ADMIN:
            return DegreeProgram.objects.all()
        else:
            raise PermissionDenied("You do not have permission to access this resource.")


class DegreeProgramCreateView(CreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = degree_program_serializers.AdminDegreeProgramSerializer


class UserDegreeProgramCreateView(CreateAPIView):
    permission_classes = [IsDpdOrAdmin]
    serializer_class = degree_program_serializers.UserDegreeProgramSerializer
    queryset = UserDegreeProgram.objects.all()

    def create(self, request, *args, **kwargs):
        username = request.data.get('username', None)
        abbreviation = request.data.get('abbreviation', None)

        if not username or not abbreviation:
            return Response(
                {"detail": "User or Degree Program not found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = get_object_or_404(User, username=username)
        degree_program = get_object_or_404(DegreeProgram, abbreviation=abbreviation)

        user_degree_program = UserDegreeProgram(user=user, degree_program=degree_program)
        user_degree_program.save()
        return Response(status=status.HTTP_201_CREATED)


class DegreeProgramRetrieveView(RetrieveAPIView):
    permission_classes = [IsDegreeProgramDirector]
    serializer_class = degree_program_serializers.DegreeProgramSerializer
    queryset = DegreeProgram.objects.all()
    lookup_field = "abbreviation"


class UserDegreeProgramDeleteView(DestroyAPIView):
    permission_classes = [IsDpdOrAdmin]
    serializer_class = degree_program_serializers.UserDegreeProgramSerializer

    def get_object(self):
        username = self.kwargs.get('username')
        abbreviation = self.kwargs.get('abbreviation')
        return get_object_or_404(UserDegreeProgram, user__username=username, degree_program__abbreviation=abbreviation)
