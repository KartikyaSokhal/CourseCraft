from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from courses.models import Course, Enrollment, Attendance

@login_required
def dashboard(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    enrollments = Enrollment.objects.filter(course=course).select_related('student','current_lesson')
    stats = {
        'total_students': enrollments.count(),
        'completed': enrollments.filter(passed=True).count(),
        'avg_score': round(sum(e.score for e in enrollments)/enrollments.count(),2) if enrollments else 0,
        'focus_issues': Attendance.objects.filter(lesson__course=course, event='blur').count(),
    }
    return render(request, 'analytics/dashboard.html', {'course': course, 'enrollments': enrollments, 'stats': stats})
