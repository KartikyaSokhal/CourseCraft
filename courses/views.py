import json
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponseForbidden
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import Course, Lesson, MCQQuestion, MCQChoice, Enrollment, Attendance
from .forms import AICourseForm, CourseForm, ReviewForm
from .ai_service import generate_course_with_openai  # ✅ Updated import
from .utils import admin_required


def list_courses(request):
    courses = Course.objects.filter(is_published=True).order_by('-created_at')
    return render(request, 'courses/list.html', {'courses': courses})


@login_required
def enroll(request, course_id):
    course = get_object_or_404(Course, id=course_id, is_published=True)
    enrollment, created = Enrollment.objects.get_or_create(student=request.user, course=course)
    if created and course.lessons.exists():
        enrollment.current_lesson = course.lessons.first()
        enrollment.save()
    messages.success(request, "Enrolled successfully.")
    return redirect('courses:detail', course_id=course.id)


@login_required
def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    enrollment = None
    if request.user.is_authenticated:
        enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
    reviews = course.reviews.select_related('user').all()
    review_form = ReviewForm()
    return render(request, 'courses/detail.html', {
        'course': course,
        'enrollment': enrollment,
        'reviews': reviews,
        'review_form': review_form
    })


@login_required
def lesson_view(request, course_id, lesson_id):
    course = get_object_or_404(Course, id=course_id, is_published=True)
    lesson = get_object_or_404(Lesson, id=lesson_id, course=course)
    enrollment = get_object_or_404(Enrollment, student=request.user, course=course)

    if enrollment.current_lesson and lesson.order > enrollment.current_lesson.order:
        messages.error(request, "Please complete previous lessons first.")
        return redirect('courses:lesson', course_id=course.id, lesson_id=enrollment.current_lesson.id)

    return render(request, 'courses/lesson.html', {'course': course, 'lesson': lesson, 'enrollment': enrollment})


@login_required
def record_event(request, course_id, lesson_id):
    if request.method != 'POST':
        return HttpResponseForbidden()
    enrollment = Enrollment.objects.filter(student=request.user, course_id=course_id).first()
    if not enrollment:
        return HttpResponseForbidden()

    payload = json.loads(request.body.decode('utf-8') or '{}')
    Attendance.objects.create(enrollment=enrollment, lesson_id=lesson_id, event=payload.get('event', 'unknown'), meta=payload)
    return JsonResponse({'ok': True})


@login_required
def submit_quiz(request, course_id, lesson_id):
    lesson = get_object_or_404(Lesson, id=lesson_id, course_id=course_id)
    enrollment = get_object_or_404(Enrollment, student=request.user, course_id=course_id)

    correct = 0
    total = lesson.questions.count()
    for q in lesson.questions.all():
        choice_id = request.POST.get(f"q_{q.id}")
        if not choice_id:
            continue
        try:
            c = MCQChoice.objects.get(id=int(choice_id), question=q)
            if c.is_correct:
                correct += 1
        except MCQChoice.DoesNotExist:
            pass
    score = (correct / total) * 100 if total else 0
    Attendance.objects.create(enrollment=enrollment, lesson=lesson, event='quiz_submit', meta={'score': score})
    passed = score == 100
    if passed:
        enrollment.completed_lessons.add(lesson)
        next_lesson = lesson.course.lessons.filter(order__gt=lesson.order).first()
        if next_lesson:
            enrollment.current_lesson = next_lesson
        else:
            enrollment.passed = True
        enrollment.score = score
        enrollment.save()
        messages.success(request, f"Quiz passed with {score:.0f}%. Next lesson unlocked.")
    else:
        messages.error(request, f"You need 100% to proceed. You scored {score:.0f}%.")
    return redirect('courses:lesson', course_id=course_id, lesson_id=lesson.id)


@admin_required
def ai_create_course(request):
    if request.method == 'POST':
        form = AICourseForm(request.POST)
        if form.is_valid():
            data = generate_course_with_openai(  # ✅ Updated function call
                prompt=form.cleaned_data['prompt'],
                modules=form.cleaned_data['modules'],
                duration_days=form.cleaned_data['duration_days']
            )

            # ✅ Error handling for AI failure
            if not isinstance(data, dict) or "error" in data:
                messages.error(request, f"AI failed to generate course: {data.get('error', 'Unknown error')}")
                return redirect('courses:ai_create')

            course = Course.objects.create(
                title=data.get('title', 'Untitled'),
                description=data.get('description', ''),
                created_by=request.user,
                duration_days=form.cleaned_data['duration_days'],
                modules=data.get('modules', []),
                youtube_links=data.get('youtube_links', []),
                is_published=False
            )

            for i, l in enumerate(data.get('lessons', []), start=1):
                lesson = Lesson.objects.create(
                    course=course,
                    title=l.get('title', f'Lesson {i}'),
                    video_url=l.get('video_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
                    duration_seconds=int(l.get('duration_seconds', 0)),
                    order=int(l.get('order', i))
                )
                for q in l.get('questions', []):
                    qobj = MCQQuestion.objects.create(lesson=lesson, text=q.get('question', '?'))
                    choices = q.get('choices', [])
                    correct_index = q.get('correct_index', 0)
                    for idx, ch in enumerate(choices):
                        MCQChoice.objects.create(question=qobj, text=ch, is_correct=(idx == correct_index))

            messages.success(request, "AI-generated course created (draft). Review & publish.")
            return redirect('courses:edit', course_id=course.id)
    else:
        form = AICourseForm()
    return render(request, 'courses/ai_create.html', {'form': form})


@admin_required
def edit_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    if request.method == 'POST':
        form = CourseForm(request.POST, instance=course)
        if form.is_valid():
            form.save()
            messages.success(request, "Course updated.")
            return redirect('courses:detail', course_id=course.id)
    else:
        form = CourseForm(instance=course)
    return render(request, 'courses/edit.html', {'form': form, 'course': course})
