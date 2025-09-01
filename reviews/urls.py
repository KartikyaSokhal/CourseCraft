from django.urls import path
from .views import add_review

app_name = 'reviews'
urlpatterns = [
    path('<int:course_id>/add/', add_review, name='add'),
]
