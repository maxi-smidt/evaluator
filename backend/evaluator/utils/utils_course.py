import json

from collections import defaultdict
from ..models import CourseExercise, Course, StudentCourse


def get_full_course(course: Course):
    """
    Returns a curse as a json object with all the exercises associated
    :param course: The course that should be evaluated
    :return: json object of the course with all exercises
    """
    course_exercises = CourseExercise.objects.filter(course_id=course.id)
    exercises = [{'id': c_e.exercise_id,
                  'name': c_e.exercise.name,
                  'dueTo': c_e.due_to,
                  'state': c_e.state.name,
                  'maxParticipants': __get_participants_count(c_e),
                  'correctedParticipants': __get_corrected_participants(c_e)}
                 for c_e in course_exercises]
    full_course = {'id': course.id, 'name': course.name, 'exercises': exercises}
    return json.dumps(full_course, default=str)


def __get_participants_count(course_exercise: CourseExercise):
    course = Course.objects.get(id=course_exercise.course_id)
    course_participants = StudentCourse.objects.filter(course_id=course.id)
    return course_participants.count()


def __get_corrected_participants(course_exercise: CourseExercise):
    return 0  # todo


def get_students_of_course_by_group(course: Course):
    course_students = StudentCourse.objects.filter(course_id=course.id)
    return __group_students_into_dict(course_students)


def __group_students_into_dict(students_course):
    grouped_students = defaultdict(list)

    for sc in students_course:
        grouped_students[sc.group].append(
            {
                'id': sc.student.s_number,
                'firstName': sc.student.firstname,
                'lastName': sc.student.lastname
            }
        )
    return dict(grouped_students)
