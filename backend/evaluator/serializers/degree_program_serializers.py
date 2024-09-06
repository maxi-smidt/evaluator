from rest_framework import serializers

from ..models import DegreeProgram, UserDegreeProgram
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
