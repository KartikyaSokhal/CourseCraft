from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import User

class RegisterForm(UserCreationForm):
    role = forms.ChoiceField(choices=User.Role.choices)
    class Meta:
        model = User
        fields = ('username', 'email', 'role')

class LoginForm(AuthenticationForm):
    pass
