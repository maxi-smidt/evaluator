import os
from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Clears the database, applies all migrations, and runs the seeder.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("--- Starting Full Database Reset ---"))
        self.stdout.write("\n1. Clearing the database...")
        try:
            call_command('clear_db')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Clear failed. Aborting. Error: {e}"))
            return

        self.stdout.write("\n2. Applying migrations...")
        try:
            call_command('migrate', interactive=False)
            self.stdout.write(self.style.SUCCESS("Migrations applied successfully."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Migration failed. Aborting. Error: {e}"))
            return

        self.stdout.write("\n3. Seeding the database...")
        try:
            fixture_file = os.path.join(settings.BASE_DIR, 'evaluator', 'management', 'seed_data.json')
            call_command('loaddata', fixture_file)
            self.stdout.write(self.style.SUCCESS("Database seeded successfully."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Seeding failed. Aborting. Error: {e}"))
            return

        self.stdout.write(self.style.NOTICE("\n--- Database Reset Complete (Clear, Migrate, Seed) ---"))