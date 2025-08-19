from django.conf import settings
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

User = settings.AUTH_USER_MODEL

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_courses')
    schedule = models.JSONField(default=dict, blank=True)
    duration_days = models.PositiveIntegerField(default=30)
    modules = models.JSONField(default=list, blank=True)
    youtube_links = models.JSONField(default=list, blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title
# add to courses/models.py (below Course)
class Module(models.Model):
    course = models.ForeignKey(Course, related_name="course_modules", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    objectives = models.JSONField(default=list, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.title} — {self.name}"


class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    video_url = models.URLField()
    duration_seconds = models.PositiveIntegerField(default=0)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

class MCQQuestion(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()

class MCQChoice(models.Model):
    question = models.ForeignKey(MCQQuestion, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    current_lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True)
    completed_lessons = models.ManyToManyField(Lesson, related_name='completed_by', blank=True)
    score = models.FloatField(default=0.0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    passed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('student','course')

class Attendance(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='attendance_events')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    event = models.CharField(max_length=50)
    meta = models.JSONField(default=dict, blank=True)

class Review(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course','user')
