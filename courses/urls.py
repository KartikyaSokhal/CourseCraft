from django.urls import path
from . import views

app_name = 'courses'
urlpatterns = [
    path('', views.list_courses, name='list'),
    path('<int:course_id>/', views.course_detail, name='detail'),
    path('<int:course_id>/enroll/', views.enroll, name='enroll'),
    path('<int:course_id>/lessons/<int:lesson_id>/', views.lesson_view, name='lesson'),
    path('<int:course_id>/lessons/<int:lesson_id>/quiz/', views.submit_quiz, name='submit_quiz'),
    path('ai/create/', views.ai_create_course, name='ai_create'),
    path('<int:course_id>/edit/', views.edit_course, name='edit'),
    path('<int:course_id>/lessons/<int:lesson_id>/event/', views.record_event, name='record_event'),
]
