from rest_framework import serializers
from .models import User, DegreeProgramDirector, Tutor


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'role', 'is_active', 'password']

    def __init__(self, *args, **kwargs):
        super(UserSerializer, self).__init__(*args, **kwargs)
        include_password = self.context.get('include_password', False)
        if not include_password:
            self.fields.pop('password', None)


class DegreeProgramDirectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = DegreeProgramDirector
        fields = ['username', 'first_name', 'last_name']


class TutorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tutor
        fields = ['username', 'first_name', 'last_name']