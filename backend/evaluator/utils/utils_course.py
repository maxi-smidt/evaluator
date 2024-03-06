from ..models import CourseInstance, TutorAssignment


def set_tutor_course_partition(course_instance: CourseInstance, new_partition):
    for part in new_partition:
        tutor = course_instance.tutors.get(pk=part['tutor']['id'])
        ai = course_instance.assignment_instances.get(pk=part['assignment']['id'])
        new_groups = sorted(part['groups'])
        try:
            ta = TutorAssignment.objects.get(tutor=tutor, assignment_instance=ai)
            if not new_groups:
                ta.delete()
            elif ta.groups != new_groups:
                ta.groups = new_groups
                ta.save()
        except TutorAssignment.DoesNotExist:
            if new_groups:
                ta = TutorAssignment(tutor=tutor, assignment_instance=ai, groups=new_groups)
                ta.save()
