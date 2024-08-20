from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import User, DegreeProgramDirector, Tutor
# noinspection PyUnresolvedReferences
from evaluator.models import CourseLeader, UserDegreeProgram


class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name']


class UserSerializer(SimpleUserSerializer):
    class Meta(SimpleUserSerializer.Meta):
        fields = SimpleUserSerializer.Meta.fields + ['role']


class DetailUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['is_active']


class PasswordUserSerializer(DetailUserSerializer):
    class Meta(DetailUserSerializer.Meta):
        fields = DetailUserSerializer.Meta.fields + ['password']


class DegreeProgramDirectorSerializer(SimpleUserSerializer):
    class Meta(SimpleUserSerializer.Meta):
        model = DegreeProgramDirector


class TutorSerializer(SimpleUserSerializer):
    class Meta(SimpleUserSerializer.Meta):
        model = Tutor


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct")
        return value

    def validate(self, data):
        if data['new_password'] == data['old_password']:
            raise serializers.ValidationError('New password cannot be the same as the old password')
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError('New passwords must match')
        validate_password(data['new_password'])
        return data
