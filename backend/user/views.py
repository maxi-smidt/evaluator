from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, CreateAPIView, RetrieveAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import User, DegreeProgramDirector
from .serializers import UserSerializer, DegreeProgramDirectorSerializer
from .permissions import IsClOrDpdOrAdmin, IsAdmin


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            response = super().post(request, *args, **kwargs)
            return Response({'token': response.data, 'user': UserSerializer(user).data})
        return Response(status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(RetrieveAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserCreateView(CreateAPIView):
    permission_classes = [IsClOrDpdOrAdmin]
    serializer_class = UserSerializer

    def get_serializer_context(self):
        context = super(UserCreateView, self).get_serializer_context()
        context['include_password'] = True
        return context

    def perform_create(self, serializer):
        instance = serializer.save()
        instance.set_password(serializer.validated_data['password'])
        instance.save()

    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class UserListView(ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserUpdateView(APIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        for user in request.data:
            instance = User.objects.get(username=user.get('username'))
            serializer = UserSerializer(instance, data=user, partial=True)
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)


class DegreeProgramDirectorListView(ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = DegreeProgramDirectorSerializer
    queryset = DegreeProgramDirector.objects.all()
