import io
import json
from datetime import timedelta

from django.contrib.auth import authenticate
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

from .models import (User, Tutor, Correction, Assignment, CourseEnrollment, TutorAssignment, CourseLeader,
                     DegreeProgramDirector, DegreeProgram)
from .utils.pdf_maker import PdfMaker
from .utils.utils_course import (get_full_course, get_students_of_course_by_group,
                                 set_groups_students_of_course, set_tutor_course_partition)
from .utils.utils_exercise import get_full_assignment


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            response = super().post(request, *args, **kwargs)
            user = {'firstName': user.first_name, 'lastName': user.last_name, 'id': user.username, 'role': user.role}
            return JsonResponse({'token': response.data, 'user': user})
        else:
            return JsonResponse({'error': 'Invalid Credentials'}, status=400)


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            user = get_object_or_404(User, pk=request.user.id)
            user = {'firstName': user.first_name, 'lastName': user.last_name, 'id': user.username, 'role': user.role}
            return JsonResponse({'token': response.data, 'user': user})
        return JsonResponse(response.data)


@api_view(['GET'])
def get_user(request):
    user = get_object_or_404(User, pk=request.user.id)
    return JsonResponse({'firstName': user.first_name, 'lastName': user.last_name,
                         'id': user.username, 'role': user.role})


@api_view(['GET'])
def get_courses(request):
    print(request.body)
    print(request.headers)
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    courses = [{'id': tutor_course.course.id, 'name': f'{tutor_course.course.abbreviation} {tutor_course.year}'}
               for tutor_course in tutor.ci_tutors.all()]
    return JsonResponse(courses, safe=False)


@api_view(['GET'])
def get_exercises_by_course(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = tutor.ci_tutors.get(pk=request.GET.get('course_id'))
    full_course = get_full_course(ci)
    return HttpResponse(full_course, content_type='application/json')


@api_view(['GET'])
def get_assignment(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = tutor.ci_tutors.get(pk=request.GET.get('course_id'))
    ai = ci.assignment_instances.get(assignment_id=request.GET.get('assignment_id'))
    full_assignment = get_full_assignment(ai)
    try:
        ta = TutorAssignment.objects.get(tutor=tutor, assignment_instance=ai)
        target_groups = ta.groups
    except TutorAssignment.DoesNotExist:
        target_groups = []
    response = {'assignment': json.loads(full_assignment), 'targetGroups': target_groups}
    return JsonResponse(response, content_type='application/json')


@api_view(['GET', 'POST'])
def set_or_get_student_course_group(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    course_id = request.GET.get('course_id') or request.data.get('course_id')
    ci = get_object_or_404(tutor.ci_tutors, pk=course_id)
    if request.method == 'POST':
        set_groups_students_of_course(ci, request.data['students'])
    students = get_students_of_course_by_group(ci)
    return HttpResponse(json.dumps(students), content_type='application/json')


@api_view(['POST'])
def set_correction_state(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = get_object_or_404(tutor.ci_tutors, pk=request.data['course_id'])
    student = get_object_or_404(ci.students, pk=request.data['student_id'])
    ai = get_object_or_404(ci.assignment_instances, pk=request.data['assignment_id'])
    state = {
        'IN_PROGRESS': Correction.Status.IN_PROGRESS,
        'CORRECTED': Correction.Status.CORRECTED,
        'UNDEFINED': Correction.Status.UNDEFINED,
        'NOT_SUBMITTED': Correction.Status.NOT_SUBMITTED
    }[request.data['state']]
    try:
        corr = Correction.objects.get(student=student, assignment_instance=ai, tutor=tutor)
    except Correction.DoesNotExist:
        corr = Correction(student=student, assignment_instance=ai, tutor=tutor)
    finally:
        corr.status = state
        corr.save()
    full_assignment = get_full_assignment(ai)
    return HttpResponse(full_assignment, content_type='application/json')


@api_view(['POST'])
def delete_correction(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = get_object_or_404(tutor.ci_tutors, pk=request.data['course_id'])
    student = get_object_or_404(ci.students, pk=request.data['student_id'])
    ai = get_object_or_404(ci.assignment_instances, pk=request.data['assignment_id'])
    corr = get_object_or_404(Correction, student=student, assignment_instance=ai)
    if corr.tutor != tutor:
        return JsonResponse(data={}, status=403)
    corr.delete()
    full_assignment = get_full_assignment(ai)
    return HttpResponse(full_assignment, content_type='application/json')


@api_view(['POST'])
def get_correction(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = get_object_or_404(tutor.ci_tutors, pk=request.data['course_id'])
    student = get_object_or_404(ci.students, pk=request.data['student_id'])
    ai = get_object_or_404(ci.assignment_instances, pk=request.data['assignment_id'])

    try:
        corr = Correction.objects.get(student=student, assignment_instance=ai)
    except Correction.DoesNotExist:
        corr = Correction(student=student, assignment_instance=ai, tutor=tutor,
                          points=ai.assignment.points, draft=make_base_correction_draft(ai.assignment),
                          status=Correction.Status.IN_PROGRESS)
        corr.save()
    correction = {
        'assignmentName': ai.assignment.name,
        'assignmentPoints': ai.assignment.points,
        'studentFullName': f'{student.first_name} {student.last_name}',
        'expense': corr.expense.total_seconds() / 3600 if corr.expense else None,
        'points': corr.points,
        'status': corr.status,
        'draft': corr.draft
    }
    lock = False if corr.tutor == tutor else True
    return JsonResponse({'correction': correction, 'lock': lock})


def make_base_correction_draft(assignment: Assignment):
    draft = {'annotations': [], 'exercise': [
        {'name': exc['name'], 'sub': [{'name': sub_exc['name'], 'points': sub_exc['points'], 'notes': []}
                                      for sub_exc in exc['distribution']]} for exc in assignment.draft]}
    return draft


@api_view(['POST'])
def save_correction(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = get_object_or_404(tutor.ci_tutors, pk=request.data['course_id'])
    student = get_object_or_404(ci.students, pk=request.data['student_id'])
    ai = get_object_or_404(ci.assignment_instances, pk=request.data['assignment_id'])
    corr = get_object_or_404(Correction, student=student, assignment_instance=ai, tutor=tutor)
    correction = request.data['correction']
    corr.draft = correction['draft']
    corr.points = correction['points']
    corr.expense = timedelta(hours=correction['expense']) if correction['expense'] else None
    corr.save()
    return HttpResponse()


@api_view(['POST'])
def download_correction(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = get_object_or_404(tutor.ci_tutors, pk=request.data['course_id'])
    student = get_object_or_404(ci.students, pk=request.data['student_id'])
    ai = get_object_or_404(ci.assignment_instances, pk=request.data['assignment_id'])
    corr = get_object_or_404(Correction, student=student, assignment_instance=ai, tutor=tutor)
    if corr.status is not Correction.Status.CORRECTED:
        corr.status = Correction.Status.CORRECTED
        corr.save()
    pdf = PdfMaker(corr).make_pdf_stream()
    filename = corr.assignment_instance.assignment.course.file_name.format(lastname=student.last_name,
                                                                           nr="%02d" % ai.assignment.nr)
    response = HttpResponse(io.BytesIO(pdf), content_type='application/pdf')
    response['filename'] = f'{filename}'
    response['Access-Control-Expose-Headers'] = 'filename'
    return response


@api_view(['GET'])
def get_course_partition(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = get_object_or_404(tutor.ci_tutors, pk=request.GET.get('course_id'))
    group_selection = list(CourseEnrollment.objects.filter(course_instance=ci).exclude(group=-1)
                           .values_list('group', flat=True).distinct())
    partition = []
    for tutor in ci.tutors.all():
        for assignment in ci.assignment_instances.all():
            try:
                groups = TutorAssignment.objects.get(tutor=tutor, assignment_instance=assignment).groups
            except TutorAssignment.DoesNotExist:
                groups = []
            partition.append({
                'tutor': {'name': tutor.full_name, 'id': tutor.id},
                'assignment': {'name': assignment.assignment.name, 'id': assignment.id},
                'groups': sorted(groups)
            })
    response = {'partition': partition, 'groups': sorted(group_selection)}
    return HttpResponse(json.dumps(response, default=str), content_type='application/json')


@api_view(['POST'])
def set_course_partition(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = get_object_or_404(tutor.ci_tutors, pk=request.data['course_id'])
    set_tutor_course_partition(ci, request.data['partition'])
    return HttpResponse()


@api_view(['POST'])
def register_user(request):
    admin = get_object_or_404(User, pk=request.user.id)
    assert admin.is_superuser
    data = request.data['user']
    if data['role'] == User.Role.CL:
        new_user = CourseLeader(**data)
    elif data['role'] == User.Role.DPD:
        new_user = DegreeProgramDirector(**data)
    elif data['role'] == User.Role.TUTOR:
        new_user = Tutor(**data)
    elif data['role'] == User.Role.ADMIN:
        new_user = User(**data)
    new_user.set_password(data['password'])
    new_user.save()
    return HttpResponse()


@api_view(['GET', 'POST'])
def all_users(request):
    admin = get_object_or_404(User, pk=request.user.id)
    assert admin.role == User.Role.ADMIN
    raw_users = User.objects.all()
    users = [{'firstName': u.first_name, 'lastName': u.last_name, 'id': u.username,
              'role': u.role, 'isActive': u.is_active} for u in raw_users]
    return JsonResponse(users, safe=False)


@api_view(['POST'])
def change_user_activity_state(request):
    admin = get_object_or_404(User, pk=request.user.id)
    assert admin.role == User.Role.ADMIN
    users = request.data['users']
    for user in users:
        u = User.objects.get(username=user['id'])
        u.is_active = user['isActive']
        u.save()
    return HttpResponse()


@api_view(['GET'])
def get_degree_program_directors(request):
    admin = get_object_or_404(User, pk=request.user.id)
    assert admin.role == User.Role.ADMIN
    directors = DegreeProgramDirector.objects.all()
    response = [{'name': d.full_name, 'id': d.username} for d in directors]
    return JsonResponse(response, safe=False)


@api_view(['POST'])
def register_degree_program(request):
    admin = get_object_or_404(User, pk=request.user.id)
    assert admin.role == User.Role.ADMIN
    dp = request.data['degree_program']
    dpd = DegreeProgramDirector.objects.get(username=dp['id'])
    DegreeProgram(name=dp['name'], abbreviation=dp['abbreviation'], dp_director=dpd).save()
    return HttpResponse()


@api_view(['GET'])
def get_degree_programs(request):
    admin = get_object_or_404(User, pk=request.user.id)
    assert admin.role == User.Role.ADMIN
    programs = DegreeProgram.objects.all()
    response = [{'name': p.name, 'abbreviation': p.abbreviation, 'dpd': p.dp_director.full_name} for p in programs]
    return JsonResponse(response, safe=False)