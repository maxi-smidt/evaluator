from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from ..models import Assignment, AssignmentInstance, Correction, Student
from .assignment_serializers import MiniAssignmentSerializer
from .student_serializers import StudentSerializer
from user.models import Tutor


class CorrectionSerializer(serializers.ModelSerializer):
    assignment = serializers.SerializerMethodField(read_only=True)
    student = StudentSerializer(read_only=True)
    tutor_username = serializers.SerializerMethodField(read_only=True)
    course_instance_id = serializers.SerializerMethodField(read_only=True)

    student_id = serializers.CharField(write_only=True)
    assignment_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Correction
        fields = ['id', 'tutor_username', 'student', 'assignment', 'expense', 'points', 'status', 'draft', 'student_id',
                  'assignment_id', 'late_submitted_days', 'course_instance_id']

    @staticmethod
    def get_assignment(obj):
        return MiniAssignmentSerializer(instance=obj.assignment_instance.assignment).data

    @staticmethod
    def get_tutor_username(obj):
        return obj.tutor.username

    @staticmethod
    def get_course_instance_id(obj):
        return obj.assignment_instance.course_instance.id

    def create(self, validated_data):
        student_id = validated_data.pop('student_id')
        assignment_id = validated_data.pop('assignment_id')
        if Correction.objects.filter(student_id=student_id, assignment_instance_id=assignment_id).exists():
            raise ValidationError({"detail": "A correction for this student and assignment already exists."})
        tutor = Tutor.objects.get(pk=self.context['request'].user.id)
        student = get_object_or_404(Student, pk=student_id)
        ai = get_object_or_404(AssignmentInstance, pk=assignment_id)
        status = validated_data['status']
        if status != Correction.Status.NOT_SUBMITTED:
            validated_data['points'] = AssignmentInstance.objects.get(pk=assignment_id).assignment.points
            if 'draft' not in validated_data or not validated_data['draft']:
                validated_data['draft'] = make_base_correction_draft(ai.assignment)

        return Correction.objects.create(tutor=tutor, student=student, assignment_instance=ai, **validated_data)


def make_base_correction_draft(assignment: Assignment):
    draft = {'annotations': [], 'exercise': [
        {'name': exc['name'], 'sub': [{'name': sub_exc['name'], 'points': sub_exc['points'], 'notes': []}
                                      for sub_exc in exc['distribution']]} for exc in assignment.draft]}
    return draft
