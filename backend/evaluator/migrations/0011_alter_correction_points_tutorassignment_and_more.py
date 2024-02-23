# Generated by Django 5.0.1 on 2024-02-23 12:17

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('evaluator', '0010_assignment_points'),
    ]

    operations = [
        migrations.AlterField(
            model_name='correction',
            name='points',
            field=models.DecimalField(decimal_places=2, max_digits=5, null=True),
        ),
        migrations.CreateModel(
            name='TutorAssignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('group', models.IntegerField()),
                ('assignment_instance', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tutor_assignments', to='evaluator.assignmentinstance')),
                ('tutor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tutor_assignments', to='evaluator.tutor')),
            ],
        ),
        migrations.AddConstraint(
            model_name='tutorassignment',
            constraint=models.CheckConstraint(check=models.Q(('group__gte', 0)), name='valid_group_number'),
        ),
        migrations.AlterUniqueTogether(
            name='tutorassignment',
            unique_together={('tutor', 'assignment_instance', 'group')},
        ),
    ]