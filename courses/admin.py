# courses/admin.py
from django.contrib import admin
from .models import Course, Module, Lesson, MCQQuestion, MCQChoice

# Inline for Module on Course (Module has FK -> Course) — OK
class ModuleInline(admin.StackedInline):
    model = Module
    extra = 0
    fields = ("name", "objectives", "order")

# Inline for MCQChoice on MCQQuestion (Choice has FK -> MCQQuestion) — OK
class MCQChoiceInline(admin.TabularInline):
    model = MCQChoice
    extra = 0

# Inline for MCQQuestion on Lesson (MCQQuestion has FK -> Lesson) — OK
class MCQQuestionInline(admin.TabularInline):
    model = MCQQuestion
    extra = 0
    fields = ("text",)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "created_by", "is_published", "created_at")
    search_fields = ("title", "created_by__username")
    inlines = (ModuleInline,)

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("name", "course", "order")
    search_fields = ("name", "course__title")
    # Do NOT inline Lesson here because Lesson has no FK -> Module

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "video_url", "order")
    search_fields = ("title", "course__title")
    list_filter = ("course",)
    inlines = (MCQQuestionInline,)  # show questions inside a lesson admin page

@admin.register(MCQQuestion)
class MCQQuestionAdmin(admin.ModelAdmin):
    list_display = ("text", "lesson")
    search_fields = ("text", "lesson__title")
    inlines = (MCQChoiceInline,)

@admin.register(MCQChoice)
class MCQChoiceAdmin(admin.ModelAdmin):
    list_display = ("text", "question", "is_correct")
    list_filter = ("is_correct",)
