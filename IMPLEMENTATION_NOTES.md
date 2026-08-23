# Implementation Notes — Critical Pre-Deployment Fixes

## Changed Files

### Backend (`ai-academy/`)

| File | Changes |
|---|---|
| `core/serializers.py` | Added `StudentQuestionSerializer` (excludes `correct_answer`), `StudentQuizSerializer`, `StudentModuleSerializer`, `StudentCourseDetailSerializer`. Existing admin serializers unchanged. |
| `core/views.py` | `CourseGenerateAPIView`: permission changed to `[IsAuthenticated, IsAdminUser]`. `CourseDetailAPIView`: permission changed to `[IsAuthenticated, IsAdminOrReadOnly]`, added `get_serializer_class()` for role-based serializer. `CourseListAPIView`: added `get_serializer_class()` for role-based serializer. `ModuleDetailAPIView`: permission changed to `[IsAuthenticated, IsAdminOrReadOnly]`. `generate_single_module`: added `context={'request': request}` to serializer call. Import added for `StudentCourseDetailSerializer`. |
| `core/tests.py` | Added `BaseTestCase` (creates admin/student users with `Profile` roles and JWT auth), `AuthorizationTests` (8 tests), `QuizAnswerProtectionTests` (4 tests). All AI calls mocked. |
| `backend/settings.py` | `SECRET_KEY` now required via env var; raises `ImproperlyConfigured` if missing. Added `from django.core.exceptions import ImproperlyConfigured`. Removed `"null"` from `CORS_ALLOWED_ORIGINS`. |
| `.env.example` | New file with placeholder variable names only (no secrets). |

### Frontend (`ai-academy/ai-academy-react/`)

| File | Changes |
|---|---|
| `src/services/api.jsx` | Added `submitQuiz(moduleId, answers)` and `submitExplanation(lessonId, transcript)` exported functions using centralized `apiFetch` with correct `accessToken`. |
| `src/components/student/StudentQuizView.jsx` | Replaced hardcoded `http://127.0.0.1:8000/api/` fetch and `localStorage.getItem('access_token')` with imported `submitQuiz` from `api.jsx`. |
| `src/components/student/LessonContent.jsx` | Replaced hardcoded localhost fetch and wrong token key with imported `submitExplanation` from `api.jsx`. Added `DOMPurify` import. `createMarkup()` now sanitizes HTML with strict allowlist. Renamed local function to `handleSubmitExplanation` to avoid name collision with imported API helper. |
| `package.json` | Added `dompurify` dependency. |
| `package-lock.json` | Updated with dompurify lockfile entries. |

## Security Fixes Applied

1. **Authorization hardening**: Students blocked from `POST /api/courses/generate/`, `PUT/PATCH/DELETE` on `/api/courses/<id>/`, and `PUT/PATCH/DELETE` on `/api/modules/<id>/`. All enforced server-side via DRF permission classes.

2. **Quiz answer protection**: Student API responses use `StudentCourseDetailSerializer` → `StudentModuleSerializer` → `StudentQuizSerializer` → `StudentQuestionSerializer` chain that omits `correct_answer`. Admin responses retain full data. Applies to course list, course detail, and generation responses (admin-only).

3. **Frontend API consistency**: Standardized on `accessToken` localStorage key. All API calls route through `api.jsx` with `VITE_API_URL` environment variable support. No hardcoded `127.0.0.1` URLs remain in React components.

4. **SECRET_KEY**: No fallback value in any environment. Application raises `ImproperlyConfigured` immediately if `SECRET_KEY` is not set. Local setup documented in `.env.example`.

5. **CORS**: Removed `"null"` from `CORS_ALLOWED_ORIGINS`.

6. **XSS protection**: AI-generated lesson HTML is sanitized via DOMPurify before `dangerouslySetInnerHTML` rendering. Allowlist limited to educational text/table formatting tags. Blocked: `script`, `style`, `iframe`, `img`, `form`, `input`, `embed`, `object`, event-handler attributes, and `data-*` attributes.

## Verification Commands Run

```
# Backend tests (12/12 passed)
SECRET_KEY="test-secret-key-for-ci-only" ./venv/bin/python manage.py test core -v2

# Frontend reproducible install + build (succeeded)
cd ai-academy/ai-academy-react && npm ci && npm run build
```

## Test Results

```
test_admin_can_access_generate_endpoint ... ok
test_admin_can_delete_course ... ok
test_admin_can_update_course ... ok
test_student_cannot_delete_course ... ok
test_student_cannot_delete_module ... ok
test_student_cannot_generate_course ... ok
test_student_cannot_update_course ... ok
test_student_cannot_update_module ... ok
test_admin_course_detail_shows_correct_answer ... ok
test_student_can_read_published_course ... ok
test_student_course_detail_hides_correct_answer ... ok
test_student_course_list_hides_correct_answer ... ok

Ran 12 tests in 3.999s — OK
```

## Failed Verification

None. All backend tests pass. React build succeeds.
