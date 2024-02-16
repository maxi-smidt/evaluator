import json

from collections import defaultdict
from ..models import CourseInstance, Correction


def get_full_course(course_instance: CourseInstance):
    ci_assignment_instances = course_instance.assignment_instances.all()

    exercises = [{'id': ai.id,
                  'name': ai.assignment.name,
                  'dueTo': ai.due_to,
                  'state': ai.status,
                  'maxParticipants': course_instance.students.count(),
                  'correctedParticipants': ai.co_assignment_instance.filter(status=Correction.Status.CORRECTED).count()}
                 for ai in ci_assignment_instances]
    full_course = {'id': course_instance.id, 'name': course_instance.course.name, 'exercises': exercises}
    return json.dumps(full_course, default=str)


def get_students_of_course_by_group(course_instance: CourseInstance):
    grouped_students = defaultdict(list)

    for enr in course_instance.courseenrollment_set.all():
        if enr.group == -1:
            continue
        grouped_students[enr.group].append(
            {
                'id': enr.student.id,
                'firstName': enr.student.first_name,
                'lastName': enr.student.last_name
            }
        )
    return dict(grouped_students)


def set_groups_students_of_course(course_instance: CourseInstance, new_order: dict):
    for group, students in new_order.items():
        for student in students:
            enr = course_instance.courseenrollment_set.get(student_id=student['id'])
            if enr.group != group:
                enr.group = group
                enr.save()
