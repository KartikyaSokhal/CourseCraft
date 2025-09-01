from django.urls import path
from .views import dashboard

app_name = 'analytics'
urlpatterns = [
    path('<int:course_id>/', dashboard, name='dashboard'),
]
