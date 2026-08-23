import getpass
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
            help='Non-interactive password for automated environments/testing only. Never recommended for manual use.'
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

        user_exists = User.objects.filter(username=username).exists()

        if not user_exists:
            if not password:
                p1 = getpass.getpass('Enter password for new admin user: ')
                if not p1 or not p1.strip():
                    raise CommandError('Password cannot be empty.')
                p2 = getpass.getpass('Confirm password: ')
                if p1 != p2:
                    raise CommandError('Passwords do not match.')
                password = p1
            elif not password.strip():
                raise CommandError('Password cannot be empty.')

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            if make_superuser:
                user.is_staff = True
                user.is_superuser = True
                user.save()
            self.stdout.write(self.style.SUCCESS(f"Created new Django user '{username}'."))
        else:
            user = User.objects.get(username=username)
            if make_superuser and not (user.is_staff and user.is_superuser):
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
