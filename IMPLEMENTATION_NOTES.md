# Implementation Notes — Pre-Deployment Fixes & Environment Hardening

## Changed Files

### Backend (`ai-academy/`)

| File | Changes |
|---|---|
| `backend/settings.py` | Loaded `ai-academy/.env` via `python-dotenv` (`load_dotenv`) before reading `SECRET_KEY` and environment configuration. `SECRET_KEY` required in all environments (raises `ImproperlyConfigured` if missing). Updated `CORS_ALLOWED_ORIGINS` to parse comma-separated env values cleanly (trimming whitespace and filtering empty strings) while preserving local dev origins (`localhost:5173`, `127.0.0.1:5173`). Removed `"null"` origin. |
| `core/serializers.py` | Added `StudentQuestionSerializer` (excludes `correct_answer`), `StudentQuizSerializer`, `StudentModuleSerializer`, `StudentCourseDetailSerializer`. Existing admin serializers unchanged. |
| `core/views.py` | `CourseGenerateAPIView`: permission restricted to `[IsAuthenticated, IsAdminUser]`. `CourseDetailAPIView` and `ModuleDetailAPIView`: permissions restricted to `[IsAuthenticated, IsAdminOrReadOnly]`. Added `get_serializer_class()` to `CourseDetailAPIView` and `CourseListAPIView` for role-based serializer selection. Added `context={'request': request}` to `generate_single_module` serializer response. |
| `core/tests.py` | Added `BaseTestCase` (creates admin/student users with `Profile` roles and JWT auth), `AuthorizationTests` (8 tests), `QuizAnswerProtectionTests` (4 tests), and `SettingsHardeningTests` (2 tests: comma-separated CORS parsing and `.env` `load_dotenv` verification). All AI calls mocked. |
| `.env.example` | Template file with placeholder variable names only (no real secrets). |

### Frontend (`ai-academy/ai-academy-react/`)

| File | Changes |
|---|---|
| `src/services/api.jsx` | Added `submitQuiz(moduleId, answers)` and `submitExplanation(lessonId, transcript)` exported functions using centralized `apiFetch` with correct `accessToken`. |
| `src/components/student/StudentQuizView.jsx` | Replaced hardcoded `http://127.0.0.1:8000/api/` fetch and `localStorage.getItem('access_token')` with imported `submitQuiz` from `api.jsx`. |
| `src/components/student/LessonContent.jsx` | Replaced hardcoded localhost fetch and wrong token key with imported `submitExplanation` from `api.jsx`. Added `DOMPurify` import. `createMarkup()` sanitizes HTML with strict educational allowlist. Renamed local function to `handleSubmitExplanation`. |
| `package.json` | Added `dompurify` dependency. |
| `package-lock.json` | Updated with dompurify lockfile entries. |

## Security Fixes & Environment Hardening Applied

1. **Environment Loading & Secret Hardening**: `load_dotenv(dotenv_path=BASE_DIR / '.env')` loads `.env` variables before reading settings. `SECRET_KEY` fails hard (`ImproperlyConfigured`) if missing in any environment. No secrets are logged or committed.

2. **CORS Parsing**: Comma-separated `CORS_ALLOWED_ORIGINS` environment variables are split, stripped of whitespace, filtered for empty values, and merged with local dev origins (`http://localhost:5173`, `http://127.0.0.1:5173`). `"null"` and wildcard origins are disallowed.

3. **Authorization Hardening**: Students blocked server-side from `POST /api/courses/generate/`, `PUT/PATCH/DELETE` on `/api/courses/<id>/`, and `PUT/PATCH/DELETE` on `/api/modules/<id>/`.

4. **Quiz Answer Protection**: Student API responses use `StudentCourseDetailSerializer` → `StudentModuleSerializer` → `StudentQuizSerializer` → `StudentQuestionSerializer` chain omitting `correct_answer`. Admin responses retain editing access with `correct_answer`.

5. **Frontend API Consistency**: Standardized on `accessToken` localStorage key. All API calls route through `api.jsx` with `VITE_API_URL` support.

6. **XSS Protection**: AI-generated lesson HTML sanitized via DOMPurify before `dangerouslySetInnerHTML` rendering. Allowlist limited to text and table formatting tags (no `img`, `script`, `style`, `iframe`, `form`, `input`, `embed`, or event handlers).

## Verification Commands Run

```bash
# Backend tests (14/14 passed)
SECRET_KEY="test-secret-key-for-ci-only" ./venv/bin/python manage.py test core -v2

# Frontend reproducible install + build (succeeded)
cd ai-academy/ai-academy-react && npm ci && npm run build
```

## Test Results

```
test_admin_can_access_generate_endpoint (core.tests.AuthorizationTests.test_admin_can_access_generate_endpoint) ... ok
test_admin_can_delete_course (core.tests.AuthorizationTests.test_admin_can_delete_course) ... ok
test_admin_can_update_course (core.tests.AuthorizationTests.test_admin_can_update_course) ... ok
test_student_cannot_delete_course (core.tests.AuthorizationTests.test_student_cannot_delete_course) ... ok
test_student_cannot_delete_module (core.tests.AuthorizationTests.test_student_cannot_delete_module) ... ok
test_student_cannot_generate_course (core.tests.AuthorizationTests.test_student_cannot_generate_course) ... ok
test_student_cannot_update_course (core.tests.AuthorizationTests.test_student_cannot_update_course) ... ok
test_student_cannot_update_module (core.tests.AuthorizationTests.test_student_cannot_update_module) ... ok
test_admin_course_detail_shows_correct_answer (core.tests.QuizAnswerProtectionTests.test_admin_course_detail_shows_correct_answer) ... ok
test_student_can_read_published_course (core.tests.QuizAnswerProtectionTests.test_student_can_read_published_course) ... ok
test_student_course_detail_hides_correct_answer (core.tests.QuizAnswerProtectionTests.test_student_course_detail_hides_correct_answer) ... ok
test_student_course_list_hides_correct_answer (core.tests.QuizAnswerProtectionTests.test_student_course_list_hides_correct_answer) ... ok
test_cors_allowed_origins_parsing (core.tests.SettingsHardeningTests.test_cors_allowed_origins_parsing) ... ok
test_load_dotenv_from_file (core.tests.SettingsHardeningTests.test_load_dotenv_from_file) ... ok

Ran 14 tests in 3.958s — OK
```

## Failed Verification

None. All 14 backend tests pass. React Vite build succeeds cleanly.
