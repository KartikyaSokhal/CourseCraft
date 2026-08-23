# Implementation Notes — Server-Side Locked Assessment Protection & Progression Fixes

## Overview of Correction

Extracted a unified, reusable server-side `is_module_locked` progression helper in `core/permissions.py` and enforced strict pre-execution locking checks on quiz submissions and lesson explanations. Locked assessment/challenge requests now return HTTP 403 Forbidden with `{"error": "LOCKED"}` before grading, before invoking Gemini, and before creating progress or attempt database rows.

---

## Changed Files

### Backend (`ai-academy/`)

| File | Changes |
|---|---|
| `core/permissions.py` | Added reusable `is_module_locked(user, module)` helper function. Returns `True` if user is unauthenticated or if the module (`order > 1`) lacks a preceding completed `UserProgress` entry. Returns `False` for `order == 1` or `ADMIN` users. |
| `core/views.py` | 1. `QuizSubmissionAPIView`: Enforced `is_module_locked(request.user, module)` check before quiz grading. Returns 403 `{"error": "LOCKED"}` without creating/updating `UserProgress`.<br>2. `ExplainOrFailAPIView`: Enforced `is_module_locked(request.user, lesson.module)` check before processing transcript. Returns 403 `{"error": "LOCKED"}` without calling Gemini or creating `ExplanationAttempt`.<br>3. `ModuleDetailAPIView`: Replaced ad-hoc locking code with `is_module_locked` helper. |
| `core/serializers.py` | Updated `StudentModuleSerializer.get_is_locked` to use the shared `is_module_locked(user, obj)` helper for consistency across serializers and API endpoints. |
| `core/tests.py` | Updated `StudentProgressionAndLockingTests` (7 tests): verifies student locked quiz 403 + no progress created, student locked explanation 403 + no Gemini call + no attempt created, unlocked quiz grading & progress recording, first module access, locked module course-detail suppression, module unlocking upon previous completion, and preserved direct module-detail 403 locking. Total 21 tests in suite. |
| `backend/settings.py` | Environment configuration & `SECRET_KEY` presence enforcement via `load_dotenv`. |
| `.env.example` | Safe template with environment variable placeholders. |

### Frontend (`ai-academy/ai-academy-react/`)

| File | Changes |
|---|---|
| `src/pages/StudentDashboard.jsx` | Passes `onRefreshCourse` callback to `<CourseViewer />` to refetch course state from backend upon assessment completion. |
| `src/components/student/CourseViewer.jsx` | Generates `{ type: 'locked', module: module }` items for locked modules. Displays non-technical student lock notification card when a locked module is selected. Passes `onRefreshCourse` as `onComplete` to `StudentQuizView` (with `moduleId`) and `LessonContent`. |
| `src/components/student/CourseSidebar.jsx` | Renders lock indicator message under locked module headers and enables selecting locked items to view the lock card. |
| `src/components/student/LessonContent.jsx` | Triggers `onComplete()` when Feynman challenge is passed (`is_passed=True`). |
| `src/components/student/StudentQuizView.jsx` | Standardized API call using `submitQuiz` helper with `onComplete()` trigger on pass. |

---

## Server-Side Locking & Security Rules

1. **Unified Lock Evaluation (`is_module_locked`)**:
   - `ADMIN` role: Always unlocked (`is_locked = False`).
   - Module `order = 1`: Always unlocked (`is_locked = False`).
   - Module `order > 1`: Locked (`is_locked = True`) unless a `UserProgress(is_completed=True)` row exists for the immediately preceding module (`order - 1` or preceding order in course).

2. **Endpoint Protection Guarantees**:
   - `POST /api/modules/<locked_id>/submit-quiz/` → HTTP 403 `{"error": "LOCKED"}`. No answers graded; no `UserProgress` row created.
   - `POST /api/lessons/<locked_id>/explain/` → HTTP 403 `{"error": "LOCKED"}`. Gemini API NOT invoked; no `ExplanationAttempt` row created.
   - `GET /api/modules/<locked_id>/` → HTTP 403 `{"error": "LOCKED"}`.
   - `GET /api/courses/<id>/` (Student Payload) → Locked module metadata returned (`id`, `title`, `order`, `module_type`, `is_locked`, `is_completed`), but `lessons = []` and `quiz = null`.

---

## Verification Commands Run

```bash
# Backend test suite (21/21 tests passed)
SECRET_KEY="test-secret-key-for-ci-only" ./venv/bin/python manage.py test core -v2

# Frontend clean install + Vite production build (succeeded)
cd ai-academy/ai-academy-react && npm ci && npm run build
```

---

## Test Results

```
test_admin_can_access_generate_endpoint (core.tests.AuthorizationTests) ... ok
test_admin_can_delete_course (core.tests.AuthorizationTests) ... ok
test_admin_can_update_course (core.tests.AuthorizationTests) ... ok
test_student_cannot_delete_course (core.tests.AuthorizationTests) ... ok
test_student_cannot_delete_module (core.tests.AuthorizationTests) ... ok
test_student_cannot_generate_course (core.tests.AuthorizationTests) ... ok
test_student_cannot_update_course (core.tests.AuthorizationTests) ... ok
test_student_cannot_update_module (core.tests.AuthorizationTests) ... ok
test_admin_course_detail_shows_correct_answer (core.tests.QuizAnswerProtectionTests) ... ok
test_student_can_read_published_course (core.tests.QuizAnswerProtectionTests) ... ok
test_student_course_detail_hides_correct_answer (core.tests.QuizAnswerProtectionTests) ... ok
test_student_course_list_hides_correct_answer (core.tests.QuizAnswerProtectionTests) ... ok
test_cors_allowed_origins_parsing (core.tests.SettingsHardeningTests) ... ok
test_load_dotenv_from_file (core.tests.SettingsHardeningTests) ... ok
test_direct_module_detail_locking_behavior_preserved (core.tests.StudentProgressionAndLockingTests) ... ok
test_quiz_submission_unlocked_module_grades_and_records_progress (core.tests.StudentProgressionAndLockingTests) ... ok
test_student_can_access_first_module_content (core.tests.StudentProgressionAndLockingTests) ... ok
test_student_cannot_obtain_locked_module_content_via_course_detail (core.tests.StudentProgressionAndLockingTests) ... ok
test_student_cannot_submit_explanation_for_locked_module (core.tests.StudentProgressionAndLockingTests) ... ok
test_student_cannot_submit_quiz_for_locked_module (core.tests.StudentProgressionAndLockingTests) ... ok
test_submitting_passing_quiz_unlocks_next_module (core.tests.StudentProgressionAndLockingTests) ... ok

----------------------------------------------------------------------
Ran 21 tests in 6.215s — OK
```

## Failed Verification

None. All 21 backend tests pass. React Vite production build succeeds cleanly.
