import json

from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['GET'])
def can_activate(request):
    response = json.dumps({'canActivateUser': request.user.is_authenticated})
    return HttpResponse(response)


@api_view(['GET'])
def can_activate_superuser(request):
    response = json.dumps({'canActivateSuperUser': request.user.is_superuser})
    print(response)
    return HttpResponse(response)

