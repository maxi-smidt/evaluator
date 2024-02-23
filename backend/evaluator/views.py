import io
import json
from datetime import timedelta
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from .models import User, Tutor, Correction, Assignment, CourseEnrollment, TutorAssignment
from .utils.pdf_maker import PDFMaker
from .utils.utils_course import (get_full_course, get_students_of_course_by_group,
                                 set_groups_students_of_course, set_tutor_course_partition)
from .utils.utils_exercise import get_full_assignment


@api_view(['GET'])
def can_activate(request):
    user = get_object_or_404(User, pk=request.user.id)
    response = json.dumps({'canActivateUser': user.is_authenticated})
    return HttpResponse(response, content_type='application/json')


@api_view(['GET'])
def can_activate_superuser(request):
    user = get_object_or_404(User, pk=request.user.id)
    response = json.dumps({'canActivateSuperUser': user.is_superuser})
    return HttpResponse(response, content_type='application/json')


@api_view(['GET'])
def get_user(request):
    user = get_object_or_404(User, pk=request.user.id)
    response = json.dumps({'firstName': user.first_name, 'lastName': user.last_name, 'sNumber': user.username})
    return HttpResponse(response, content_type='application/json')


@api_view(['GET'])
def get_courses(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    courses = [{'id': tutor_course.course.id, 'name': tutor_course.course.abbreviation}
               for tutor_course in tutor.ci_tutors.all()]
    return HttpResponse(json.dumps(courses), content_type='application/json')


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
    return HttpResponse(full_assignment, content_type='application/json')


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
    corr = get_object_or_404(Correction, student=student, assignment_instance=ai, tutor=tutor)
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
        corr = Correction.objects.get(student=student, assignment_instance=ai, tutor=tutor)
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
    return HttpResponse(json.dumps(correction, default=str), content_type='application/json')


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
    pdf = PDFMaker.generate_pdf(corr)
    response = HttpResponse(io.BytesIO(pdf), content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="your_filename.pdf"'
    return response


@api_view(['GET'])
def get_course_partition(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = get_object_or_404(tutor.ci_tutors, pk=request.GET.get('course_id'))
    groups = list(CourseEnrollment.objects.filter(course_instance=ci).values_list('group', flat=True).distinct())
    partition = []
    for tutor in ci.tutors.all():
        for assignment in ci.assignment_instances.all():
            try:
                grp = TutorAssignment.objects.get(tutor=tutor, assignment_instance=assignment).group
            except TutorAssignment.DoesNotExist:
                grp = None
            partition.append({
                'tutor': {'name': tutor.full_name, 'id': tutor.id},
                'assignment': {'name': assignment.assignment.name, 'id': assignment.id},
                'group': grp
            })
    response = {'partition': partition, 'groups': sorted(groups)}
    return HttpResponse(json.dumps(response, default=str), content_type='application/json')


@api_view(['POST'])
def set_course_partition(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = get_object_or_404(tutor.ci_tutors, pk=request.data['course_id'])
    set_tutor_course_partition(ci, request.data['partition'])
    return HttpResponse()
