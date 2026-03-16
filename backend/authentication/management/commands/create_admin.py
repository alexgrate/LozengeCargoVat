from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create the first admin user'

    def handle(self, *args, **kwargs):
        email = input("Email: ")

        # If user exists, just promote them
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            user.role = 'ADMIN'
            user.is_staff = True
            user.is_superuser = True
            user.save()
            self.stdout.write(self.style.SUCCESS(
                f'{user.full_name} has been promoted to ADMIN!'
            ))
            return

        first_name = input("First name: ")
        last_name = input("Last name: ")
        password = input("Password: ")

        user = User.objects.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            role='ADMIN',
            is_staff=True,
            is_superuser=True,
        )
        self.stdout.write(self.style.SUCCESS(
            f'Admin {user.full_name} created successfully!'
        ))