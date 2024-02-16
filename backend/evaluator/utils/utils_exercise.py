import json

from collections import defaultdict
from ..models import Correction, AssignmentInstance


def get_full_assignment(ai: AssignmentInstance):
    grouped_students = defaultdict(list)
    # TODO also return the group that is planned for the tutor
    for enr in ai.course_instance.courseenrollment_set.all():
        if enr.group == -1:
            continue
        correction = ai.co_assignment_instance.filter(student=enr.student).first()
        grouped_students[enr.group].append(
            {'id': enr.student.id,
             'firstName': enr.student.first_name,
             'lastName': enr.student.last_name,
             'state': correction.status if correction else Correction.Status.UNDEFINED,
             'points': correction.points if correction else 0
             }
        )
    grouped_students = dict(grouped_students)

    full_course = {'id': ai.id,
                   'name': ai.assignment.name,
                   'dueTo': ai.due_to,
                   'state': ai.status,
                   'maxParticipants': ai.course_instance.courseenrollment_set.count(),
                   'correctedParticipants': ai.co_assignment_instance.filter(status=Correction.Status.CORRECTED).count(),
                   'studentExercises': grouped_students}
    return json.dumps(full_course, default=str)
