import json

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import TutorCourse, Tutor, Course, Exercise
from .serializers import CustomTokenObtainPairSerializer
from .utils.utils_course import get_full_course, get_students_of_course_by_group
from .utils.utils_exercise import get_full_exercise


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['GET'])
def can_activate(request):
    user = get_object_or_404(Tutor, pk=request.user.id)
    response = json.dumps({'canActivateUser': user.is_authenticated})
    return HttpResponse(response, content_type='application/json')


@api_view(['GET'])
def can_activate_superuser(request):
    user = get_object_or_404(Tutor, pk=request.user.id)
    response = json.dumps({'canActivateSuperUser': user.is_superuser})
    return HttpResponse(response, content_type='application/json')


@api_view(['GET'])
def get_user(request):
    user = get_object_or_404(Tutor, pk=request.user.id).student
    response = json.dumps({'firstName': user.firstname, 'lastName': user.lastname, 'sNumber': user.s_number})
    return HttpResponse(response, content_type='application/json')


@api_view(['GET'])
def get_courses(request):
    tutor_id = get_object_or_404(Tutor, pk=request.user.id).id
    tutor_courses = TutorCourse.objects.filter(tutor_id=tutor_id).select_related('course')
    courses = [{'id': tutor_course.course.id, 'name': tutor_course.course.name} for tutor_course in tutor_courses]
    return HttpResponse(json.dumps(courses), content_type='application/json')


# filter here if auth
@api_view(['GET'])
def get_exercises_by_course(request):
    course_id = request.GET.get('course_id')
    course = get_object_or_404(Course, pk=course_id)
    full_course = get_full_course(course)
    return HttpResponse(full_course, content_type='application/json')


@api_view(['GET'])
def get_exercise(request):
    course_id = request.GET.get('course_id')
    exercise_id = request.GET.get('exercise_id')
    course = get_object_or_404(Course, pk=course_id)
    exercise = get_object_or_404(Exercise, pk=exercise_id)
    full_exercise = get_full_exercise(course, exercise)
    return HttpResponse(full_exercise, content_type='application/json')


@api_view(['GET'])
def get_students(request):
    course_id = request.GET.get('course_id')
    course = get_object_or_404(Course, pk=course_id)
    students = get_students_of_course_by_group(course)
    return HttpResponse(json.dumps(students), content_type='application/json')


@api_view(['POST'])
def set_student_course_group(request):
    course_id = request.POST.get('course_id')
    student = request.POST.get('students')
    print(course_id)
    print(student)

