from django.core.management import BaseCommand


class Command(BaseCommand):
    help = 'Seeds the database with development data using factories.'

    def handle(self, *args, **options):
        self.stdout.write("Starting database seeding...")

        # --- Your Seeding Logic Here ---

        # Example:
        # UserFactory.create_batch(50)
        # PostFactory.create_batch(300)

        # --- End Seeding Logic ---

        self.stdout.write(self.style.SUCCESS('Successfully seeded the database.'))