from django.urls import path, re_path
from django.views.generic import RedirectView
from . import views
from .views import CustomTokenObtainPairView

urlpatterns = [
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/can-activate/', views.can_activate, name='can_activate'),
    path('api/can-activate-superuser/', views.can_activate_superuser, name='can_activate_superuser')
]
