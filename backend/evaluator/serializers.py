from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from .models import DegreeProgram, CourseInstance, AssignmentInstance, Correction, Student, CourseEnrollment, \
    TutorAssignment, Assignment
from collections import defaultdict
# noinspection PyUnresolvedReferences
from user.models import User, Tutor, DegreeProgramDirector
# noinspection PyUnresolvedReferences
from user.serializers import DegreeProgramDirectorSerializer, TutorSerializer


class DegreeProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = DegreeProgram
        fields = ['name', 'abbreviation']


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DegreeProgram
        fields = ['name', 'abbreviation']


class CourseInstanceSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)

    class Meta:
        model = CourseInstance
        fields = ['id', 'year', 'course']


class AssignmentInstanceSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='assignment.name')
    max_participants = serializers.SerializerMethodField()
    corrected_participants = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentInstance
        fields = ['id', 'name', 'due_to', 'status', 'max_participants', 'corrected_participants']

    def get_max_participants(self, obj):
        return obj.course_instance.courseenrollment_set.filter(~Q(group=-1)).count()

    def get_corrected_participants(self, obj):
        return obj.co_assignment_instance.filter(
            ~Q(student__courseenrollment__group=-1),
            Q(status=Correction.Status.CORRECTED) | Q(status=Correction.Status.NOT_SUBMITTED)
        ).count()


class DetailCourseInstanceSerializer(CourseInstanceSerializer):
    assignments = AssignmentInstanceSerializer(source='assignment_instances', many=True)

    class Meta(CourseInstanceSerializer.Meta):
        fields = CourseInstanceSerializer.Meta.fields + ['assignments']


class AssignmentInstanceStudentSerializer(serializers.ModelSerializer):
    points = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    correction_id = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'first_name', 'last_name', 'points', 'status', 'correction_id']

    def get_points(self, obj):
        correction = obj.co_student.filter(assignment_instance=self.context['assignment_instance']).first()
        return correction.points if correction else None

    def get_status(self, obj):
        correction = obj.co_student.filter(assignment_instance=self.context['assignment_instance']).first()
        return correction.status if correction else Correction.Status.UNDEFINED

    def get_correction_id(self, obj):
        correction = obj.co_student.filter(assignment_instance=self.context['assignment_instance']).first()
        return correction.id if correction else None


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'first_name', 'last_name']


class CourseInstanceEnrollmentsSerializer(serializers.ModelSerializer):
    grouped_students = serializers.SerializerMethodField()

    class Meta:
        model = CourseInstance
        fields = ['grouped_students']

    def get_grouped_students(self, obj):
        enrollments = CourseEnrollment.objects.filter(course_instance=obj)

        grouped = defaultdict(list)
        for enrollment in enrollments:
            student_data = StudentSerializer(enrollment.student).data
            grouped[enrollment.group].append(student_data)
        return grouped

    def update(self, instance, validated_data):
        grouped_students = self.context.get('request').data.get('grouped_students')
        if grouped_students:
            self.update_groups(grouped_students, instance)
        return super().update(instance, validated_data)

    def update_groups(self, grouped_students, course_instance):
        for group, students in grouped_students.items():
            for student in students:
                enrollment = CourseEnrollment.objects.get(course_instance=course_instance, student_id=student['id'])
                enrollment.group = group
                enrollment.save()


class GroupedStudentSerializer(serializers.Serializer):
    def get_grouped_students(self, course_instance, assignment_instance=None):
        enrollments = CourseEnrollment.objects.filter(course_instance=course_instance).exclude(group=-1)
        result = defaultdict(list)
        for enrollment in enrollments:
            students_data = AssignmentInstanceStudentSerializer(enrollment.student, context={'assignment_instance': assignment_instance})
            result[enrollment.group].append(students_data.data)
        return result

    def to_representation(self, instance):
        if self.context.get('student_serializer'):
            return self.get_grouped_students(instance)
        return self.get_grouped_students(instance.course_instance, assignment_instance=instance)


class DetailAssignmentInstanceSerializer(AssignmentInstanceSerializer):
    grouped_students = serializers.SerializerMethodField()
    target_groups = serializers.SerializerMethodField()

    class Meta(AssignmentInstanceSerializer.Meta):
        fields = AssignmentInstanceSerializer.Meta.fields + ['grouped_students', 'target_groups']

    def get_grouped_students(self, assignment_instance):
        serializer = GroupedStudentSerializer(assignment_instance)
        return serializer.data

    def get_target_groups(self, obj):
        user = self.context['request'].user
        if user.role != User.Role.TUTOR:
            return []
        tutor = Tutor.objects.get(pk=user.id)
        ta = TutorAssignment.objects.filter(tutor=tutor, assignment_instance=obj).first()
        return ta.groups if ta else []


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


class MiniAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['name', 'points']


class CorrectionSerializer(serializers.ModelSerializer):
    assignment = serializers.SerializerMethodField(read_only=True)
    student = StudentSerializer(read_only=True)
    tutor_username = serializers.SerializerMethodField(read_only=True)

    student_id = serializers.IntegerField(write_only=True)
    assignment_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Correction
        fields = ['id', 'tutor_username', 'student', 'assignment', 'expense', 'points', 'status', 'draft', 'student_id',
                  'assignment_id']

    def get_assignment(self, obj):
        return MiniAssignmentSerializer(instance=obj.assignment_instance.assignment).data

    def get_tutor_username(self, obj):
        return obj.tutor.username

    def create(self, validated_data):
        student_id = validated_data.pop('student_id')
        assignment_id = validated_data.pop('assignment_id')
        tutor = Tutor.objects.get(pk=self.context['request'].user.id)
        student = get_object_or_404(Student, pk=student_id)
        ai = get_object_or_404(AssignmentInstance, pk=assignment_id)
        status = validated_data['status']
        if ('draft' not in validated_data or not validated_data['draft']) and status != Correction.Status.NOT_SUBMITTED:
            validated_data['draft'] = make_base_correction_draft(ai.assignment)

        return Correction.objects.create(tutor=tutor, student=student, assignment_instance=ai, **validated_data)


def make_base_correction_draft(assignment: Assignment):
    draft = {'annotations': [], 'exercise': [
        {'name': exc['name'], 'sub': [{'name': sub_exc['name'], 'points': sub_exc['points'], 'notes': []}
                                      for sub_exc in exc['distribution']]} for exc in assignment.draft]}
    return draft


class TutorAIGroupsSerializer(serializers.ModelSerializer):
    assignment_name = SerializerMethodField()
    groups = SerializerMethodField()

    class Meta:
        model = AssignmentInstance
        fields = ['id', 'assignment_name', 'groups']

    def get_assignment_name(self, obj):
        return obj.assignment.name

    def get_groups(self, obj):
        tutor = self.context.get('tutor')
        try:
            groups = TutorAssignment.objects.get(tutor=tutor, assignment_instance=obj).groups
        except TutorAssignment.DoesNotExist:
            groups = []
        return groups


class TutorCoursePartitionSerializer(serializers.ModelSerializer):
    groups = SerializerMethodField()
    partition = SerializerMethodField()

    class Meta:
        model = CourseInstance
        fields = ['partition', 'groups']

    def get_groups(self, obj):
        return list(CourseEnrollment.objects.filter(course_instance_id=obj).exclude(group=-1)
                    .values_list('group', flat=True).distinct().order_by('group'))

    def get_partition(self, obj):
        partition = []
        for tutor in obj.tutors.all():
            data = {'tutor': TutorSerializer(tutor).data, 'assignments': []}
            for assignment in obj.assignment_instances.all():
                data['assignments'].append(TutorAIGroupsSerializer(assignment, context={'tutor': tutor}).data)
            partition.append(data)
        return partition

    def update(self, instance, validated_data):
        partition = self.context.get('request').data.get('partition', None)
        if partition:
            self.update_partition(partition)
        return super().update(instance, validated_data)

    def update_partition(self, partition):
        for part in partition:
            tutor = Tutor.objects.get(username=part['tutor']['username'])
            for assignment in part['assignments']:
                groups = assignment['groups']
                if not groups:
                    continue
                ai = AssignmentInstance.objects.get(id=assignment['id'])
                try:
                    ta = TutorAssignment.objects.get(tutor=tutor, assignment_instance=ai)
                except TutorAssignment.DoesNotExist:
                    ta = TutorAssignment(tutor=tutor, assignment_instance=ai)
                ta.groups = groups
                ta.save()
