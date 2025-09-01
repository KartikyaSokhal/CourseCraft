
# AI Academy (Django)

## Quickstart
```bash
python -m venv .venv && source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
export DJANGO_SETTINGS_MODULE=ai_academy.settings
export GEMINI_API_KEY=your_key_here
export GEMINI_MODEL=gemini-1.5-flash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

- Admins can visit `/courses/ai/create/` to generate a course using Gemini.
- Students enroll on the course page, must watch full video (time gate) and get 100% on MCQs to progress.
- Attendance and focus/blur events are recorded for analytics at `/analytics/<course_id>/`.

**Note:** The YouTube 'watched full video' check is approximated with a duration timer and visibility tracking in JS.
