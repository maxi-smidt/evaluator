from rest_framework import serializers

from ..models import Student


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'first_name', 'last_name']


class StudentClassGroupSerializer(StudentSerializer):
    start_year = serializers.SerializerMethodField()

    class Meta(StudentSerializer.Meta):
        fields = StudentSerializer.Meta.fields + ['class_group', 'start_year']

    @staticmethod
    def get_start_year(obj):
        return obj.class_group.start_year
