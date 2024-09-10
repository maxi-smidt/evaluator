from collections import defaultdict
from django.db.models import Count, Q
from rest_framework import serializers
from rest_framework.fields import SerializerMethodField

from ..models import Assignment, AssignmentInstance, Correction, CourseEnrollment, Student, TutorAssignment
from user.models import User, Tutor


class SimpleAssignmentInstanceSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='assignment.name')

    class Meta:
        model = AssignmentInstance
        fields = ['id', 'name', 'due_to']


class AssignmentInstanceSerializer(SimpleAssignmentInstanceSerializer):
    participants_left = serializers.SerializerMethodField()

    class Meta(SimpleAssignmentInstanceSerializer.Meta):
        fields = SimpleAssignmentInstanceSerializer.Meta.fields + ['status', 'participants_left']

    @staticmethod
    def get_participants_left(obj):  # TODO log if amount of corrections exceeds 1 --> mistake happened
        participants_left = obj.course_instance.courseenrollment_set.filter(~Q(group=-1)).annotate(
            correction_count=Count(
                'student__co_student',
                filter=Q(
                    student__co_student__assignment_instance=obj,
                    student__co_student__status__in=[
                        Correction.Status.CORRECTED,
                        Correction.Status.NOT_SUBMITTED
                    ]
                )
            )
        ).filter(correction_count=0).count()
        return participants_left


class AssignmentInstanceStudentSerializer(serializers.ModelSerializer):
    points = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    correction_id = serializers.SerializerMethodField()
    late_submission = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'first_name', 'last_name', 'points', 'status', 'correction_id', 'late_submission']

    def get_points(self, obj):
        correction = obj.co_student.filter(assignment_instance=self.context['assignment_instance']).first()
        return correction.points if correction else None

    def get_status(self, obj):
        correction = obj.co_student.filter(assignment_instance=self.context['assignment_instance']).first()
        return correction.status if correction else Correction.Status.UNDEFINED

    def get_correction_id(self, obj):
        correction = obj.co_student.filter(assignment_instance=self.context['assignment_instance']).first()
        return correction.id if correction else None

    def get_late_submission(self, obj):
        course = self.context['assignment_instance'].course_instance
        assignments = course.assignment_instances.all()
        corrections = obj.co_student.filter(assignment_instance__in=assignments).all()
        return corrections.filter(late_submitted_days__gt=0).exists()


class DetailAssignmentInstanceSerializer(AssignmentInstanceSerializer):
    grouped_students = serializers.SerializerMethodField()
    target_groups = serializers.SerializerMethodField()

    class Meta(AssignmentInstanceSerializer.Meta):
        fields = AssignmentInstanceSerializer.Meta.fields + ['grouped_students', 'target_groups']

    @staticmethod
    def get_grouped_students(assignment_instance):
        serializer = GroupedStudentSerializer(assignment_instance)
        return serializer.data

    def get_target_groups(self, obj):
        user = self.context['request'].user
        if user.role != User.Role.TUTOR:
            return []
        tutor = Tutor.objects.get(id=user.id)
        ta = TutorAssignment.objects.filter(tutor=tutor, assignment_instance=obj).first()
        return ta.groups if ta else []


class MiniAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['name', 'points']


class GroupedStudentSerializer(serializers.Serializer):
    @staticmethod
    def get_grouped_students(course_instance, assignment_instance=None):
        enrollments = CourseEnrollment.objects.filter(course_instance=course_instance).exclude(group=-1)
        result = defaultdict(list)
        for enrollment in enrollments:
            students_data = AssignmentInstanceStudentSerializer(enrollment.student,
                                                                context={'assignment_instance': assignment_instance})
            result[enrollment.group].append(students_data.data)
        return result

    def to_representation(self, instance):
        if self.context.get('student_serializer'):
            return self.get_grouped_students(instance)
        return self.get_grouped_students(instance.course_instance, assignment_instance=instance)


class TutorAIGroupsSerializer(serializers.ModelSerializer):
    assignment_name = SerializerMethodField()
    groups = SerializerMethodField()

    class Meta:
        model = AssignmentInstance
        fields = ['id', 'assignment_name', 'groups']

    @staticmethod
    def get_assignment_name(obj):
        return obj.assignment.name

    def get_groups(self, obj):
        tutor = self.context.get('tutor')
        try:
            groups = TutorAssignment.objects.get(tutor=tutor, assignment_instance=obj).groups
        except TutorAssignment.DoesNotExist:
            groups = []
        return groups


class CreateAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'nr', 'name', 'course']


class SimpleAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'name', 'points']


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'
