from django.shortcuts import get_object_or_404
from rest_framework import serializers

from .student_serializers import StudentSerializer
from ..models import DegreeProgram, UserDegreeProgram, ClassGroup
from user.models import DegreeProgramDirector
from user.serializers import DegreeProgramDirectorSerializer


class DegreeProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = DegreeProgram
        fields = ['name', 'abbreviation']


class AdminDegreeProgramSerializer(DegreeProgramSerializer):
    dp_director = DegreeProgramDirectorSerializer(read_only=True)

    class Meta(DegreeProgramSerializer.Meta):
        fields = DegreeProgramSerializer.Meta.fields + ['dp_director']

    def create(self, validated_data):
        dp_director = self.initial_data.get('dp_director')
        degree_program = DegreeProgram.objects.create(**validated_data)
        degree_program.dp_director = DegreeProgramDirector.objects.get(username=dp_director['username'])
        degree_program.save()
        return degree_program


class UserDegreeProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDegreeProgram
        fields = '__all__'


class ClassGroupSerializer(serializers.ModelSerializer):
    degree_program_abbreviation = serializers.CharField(write_only=True)

    class Meta:
        model = ClassGroup
        fields = ['id', 'start_year', 'degree_program_abbreviation']

    def create(self, validated_data):
        degree_program_abbreviation = validated_data.pop('degree_program_abbreviation', None)
        degree_program = get_object_or_404(DegreeProgram, abbreviation=degree_program_abbreviation)
        validated_data['degree_program'] = degree_program
        return super().create(validated_data)


class ClassGroupListSerializer(ClassGroupSerializer):
    participant_count = serializers.SerializerMethodField()

    class Meta(ClassGroupSerializer.Meta):
        fields = ClassGroupSerializer.Meta.fields + ['participant_count']

    @staticmethod
    def get_participant_count(obj: ClassGroup):
        return obj.student_set.count()


class ClassGroupDetailSerializer(serializers.ModelSerializer):
    students = StudentSerializer(source='student_set', many=True, read_only=True)

    class Meta:
        model = ClassGroup
        fields = ['id', 'start_year', 'students']