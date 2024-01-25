import json

from collections import defaultdict
from .utils_course import __get_participants_count, __get_corrected_participants
from ..models import Exercise, Course, StudentCourse, Student, Correction, CourseExercise


def get_full_exercise(course: Course, exercise: Exercise):
    """
    Returns an exercise as a json object with all the information associated
    :param course: The course the exercise is related with
    :param exercise: The exercise
    :return: json object of the exercise
    """
    exercise_students = StudentCourse.objects.filter(course_id=course.id)

    grouped_students = defaultdict(list)

    for es in exercise_students:
        grouped_students[es.group].append(
            {'id': es.student.s_number,
             'firstName': es.student.firstname,
             'lastName': es.student.lastname,
             **__get_state_and_points(es.student, course, exercise)
             }
        )
    grouped_students = dict(grouped_students)

    course_exercise = CourseExercise.objects.get(course_id=course.id, exercise_id=exercise.id)

    full_course = {'id': exercise.id,
                   'name': exercise.name,
                   'dueTo': course_exercise.due_to,
                   'state': course_exercise.state,
                   'maxParticipants': __get_participants_count(course_exercise),
                   'correctedParticipants': __get_corrected_participants(course_exercise),
                   'studentExercises': grouped_students}
    return json.dumps(full_course, default=str)


def __get_state_and_points(student: Student, course: Course, exercise: Exercise):
    try:
        correction = Correction.objects.get(exercise_id=exercise.id, student_id=student.s_number, course_id=course.id)
        return {'state': correction.state.label, 'points': correction.points}
    except Correction.DoesNotExist:
        return {'state': Correction.StateEnum.OTHER.label, 'points': 0}
