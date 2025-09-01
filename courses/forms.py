from django import forms
from .models import Course, Review

class AICourseForm(forms.Form):
    prompt = forms.CharField(widget=forms.Textarea, help_text="Describe the course goals, audience, prerequisites.")
    modules = forms.IntegerField(min_value=1, max_value=20, initial=5)
    duration_days = forms.IntegerField(min_value=1, max_value=365, initial=30)

class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ['title','description','duration_days','is_published']

class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = ['rating','comment']
