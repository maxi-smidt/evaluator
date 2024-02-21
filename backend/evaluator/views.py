import json

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from .models import User, Tutor, Correction, Student, AssignmentInstance, Assignment
from .utils.utils_course import get_full_course, get_students_of_course_by_group, set_groups_students_of_course
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


@api_view(['GET'])
def get_students(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = get_object_or_404(tutor.ci_tutors, pk=request.GET.get('course_id'))
    students = get_students_of_course_by_group(ci)
    return HttpResponse(json.dumps(students), content_type='application/json')


@api_view(['POST'])
def set_student_course_group(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = get_object_or_404(tutor.ci_tutors, pk=request.data['course_id'])
    set_groups_students_of_course(ci, request.data['students'])
    return HttpResponse()


@api_view(['POST'])
def set_correction_not_submitted(request):
    tutor = get_object_or_404(Tutor, pk=request.user.id)
    ci = get_object_or_404(tutor.ci_tutors, pk=request.data['course_id'])
    student = get_object_or_404(ci.students, pk=request.data['student_id'])
    ai = get_object_or_404(ci.assignment_instances, pk=request.data['assignment_id'])
    try:
        corr = Correction.objects.get(student=student, assignment_instance=ai, tutor=tutor)
    except Correction.DoesNotExist:
        corr = Correction(student=student, assignment_instance=ai, tutor=tutor)
    finally:
        corr.status = Correction.Status.NOT_SUBMITTED
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
        'studentFullName': f'{student.first_name} {student.last_name}',
        'expense': corr.expense,
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


"""
[
{"name": "Beispiel 1", 
"distribution": 
    [
        {"name": "L\u00f6sungsidee", "points": 3}, 
        {"name": "Quellcode", "points": 17}, 
        {"name": "Testf\u00e4lle", "points": 10}]}, 
{"name": "Beispiel 2", 
"distribution": [
        {"name": "L\u00f6sungsidee", "points": 4}, 
        {"name": "Quellcode", "points": 23}, 
        {"name": "Testf\u00e4lle", "points": 13}]}, 
{"name": "Beispiel 3", 
"distribution": [
        {"name": "L\u00f6sungsidee", "points": 3}, 
        {"name": "Quellcode", "points": 17}, 
        {"name": "Testf\u00e4lle", "points": 10}]}]
"""

"""
"annotations": [
    {
      "points": -1,
      "text": "Anmerkung 1"
    },
    {
      "points": 2,
      "text": "Anmerkung 2"
    }
  ],
  "exercises": [
    {
      "name": "Beispiel 1",
      "points": "103/100",
      "sub_ev": [
        {
          "name": "Lösungsidee",
          "points": "11/10",
          "notes": [
            {"points": -3,
              "text": "Lösungsidee 1"
            },
            {"points": 4,
              "text": "Lösungsidee 2"
            }
          ]
        },
        {
          "name": "Quellcode",
          "points": "58/57",
          "notes": [
            {
              "points": -5,
              "text": "Quellcode 1"
            },
            {
              "points": 6,
              "text": "Quellcode 2"
            }
          ]
        },
        {
          "name": "Testfälle",
          "points": "34/33",
          "notes": [
            {
              "points": -7,
              "text": "Testfall 1"
            },
            {
              "points": 8,
              "text": "Testfall 2"
            }
          ]
        }
      ]
    }
  ]
"""
