from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from core.models import Profile


class Command(BaseCommand):
    help = 'Idempotently creates or promotes a user to the CourseCraft ADMIN profile role.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            required=True,
            help='Username of the user to create or promote to ADMIN role.'
        )
        parser.add_argument(
            '--password',
            type=str,
            required=False,
            default=None,
            help='Password for new user creation (optional; never printed).'
        )
        parser.add_argument(
            '--email',
            type=str,
            required=False,
            default='',
            help='Email address for new user creation (optional).'
        )
        parser.add_argument(
            '--is-superuser',
            action='store_true',
            help='Also grant Django staff and superuser permissions.'
        )

    def handle(self, *args, **options):
        username = options['username'].strip()
        password = options.get('password')
        email = options.get('email', '').strip()
        make_superuser = options.get('is_superuser', False)

        if not username:
            raise CommandError('Username cannot be empty.')

        user, created = User.objects.get_or_create(
            username=username,
            defaults={'email': email}
        )

        if created:
            if password:
                user.set_password(password)
            else:
                user.set_unusable_password()
            if make_superuser:
                user.is_staff = True
                user.is_superuser = True
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created new Django user '{username}'."))
        else:
            if make_superuser:
                user.is_staff = True
                user.is_superuser = True
                user.save()
            self.stdout.write(self.style.SUCCESS(f"User '{username}' already exists."))

        profile, profile_created = Profile.objects.get_or_create(
            user=user,
            defaults={'role': Profile.Role.ADMIN}
        )

        if not profile_created and profile.role != Profile.Role.ADMIN:
            profile.role = Profile.Role.ADMIN
            profile.save()
            self.stdout.write(self.style.SUCCESS(f"Promoted user '{username}' to ADMIN role."))
        else:
            self.stdout.write(self.style.SUCCESS(f"User '{username}' confirmed with ADMIN role."))
