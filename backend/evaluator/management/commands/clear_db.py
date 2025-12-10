from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Clears **ALL** data from the database using a schema drop/create.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Attempting to clear the entire database..."))
        db_name = connection.settings_dict['NAME']

        with connection.cursor() as cursor:
            try:
                cursor.execute(f"""
                    SELECT pg_terminate_backend(pg_stat_activity.pid)
                    FROM pg_stat_activity
                    WHERE pg_stat_activity.datname = '{db_name}'
                      AND pid <> pg_backend_pid();
                """)
                self.stdout.write(f"Terminated connections to database: {db_name}")

                cursor.execute("DROP SCHEMA public CASCADE;")
                cursor.execute("CREATE SCHEMA public;")
                self.stdout.write(self.style.SUCCESS("Schema dropped and recreated. Database is now empty."))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Database clearing failed: {e}"))
                self.stdout.write(self.style.ERROR("Ensure your user has permission to drop schemas."))