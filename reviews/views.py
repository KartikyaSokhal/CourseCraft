from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect
from django.contrib import messages
from courses.models import Course
from courses.forms import ReviewForm

@login_required
def add_review(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    form = ReviewForm(request.POST)
    if form.is_valid():
        r = form.save(commit=False)
        r.course = course
        r.user = request.user
        try:
            r.save()
            messages.success(request, "Review added.")
        except Exception as e:
            messages.error(request, "You already reviewed this course.")
    return redirect('courses:detail', course_id=course_id)
