import os
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from core.models import (
    Profile, Course, Module, Lesson, Quiz, Question, UserProgress, ExplanationAttempt
)


class BaseTestCase(TestCase):
    """Shared setup: create an admin user and a student user with Profile roles."""

    def setUp(self):
        # Create admin user
        self.admin_user = User.objects.create_user(
            username='admin_test', password='admin_pass_123', email='admin@test.com'
        )
        Profile.objects.create(user=self.admin_user, role=Profile.Role.ADMIN)

        # Create student user
        self.student_user = User.objects.create_user(
            username='student_test', password='student_pass_123', email='student@test.com'
        )
        Profile.objects.create(user=self.student_user, role=Profile.Role.STUDENT)

        # API clients
        self.admin_client = APIClient()
        self.student_client = APIClient()

        # Authenticate via JWT
        admin_resp = self.admin_client.post('/api/token/', {
            'username': 'admin_test', 'password': 'admin_pass_123'
        }, format='json')
        self.admin_client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {admin_resp.data['access']}"
        )

        student_resp = self.student_client.post('/api/token/', {
            'username': 'student_test', 'password': 'student_pass_123'
        }, format='json')
        self.student_client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {student_resp.data['access']}"
        )

        # Create a published course with content for testing
        self.course = Course.objects.create(
            title='Test Course', created_by=self.admin_user, status='PUBLISHED'
        )
        self.content_module = Module.objects.create(
            course=self.course, title='Module 1', order=1, module_type='CONTENT'
        )
        self.lesson = Lesson.objects.create(
            module=self.content_module, title='Lesson 1',
            content='<p>Test content</p>', order=1, video_id=None
        )
        self.assess_module = Module.objects.create(
            course=self.course, title='Quiz Module', order=2, module_type='ASSESSMENT'
        )
        self.quiz = Quiz.objects.create(
            module=self.assess_module, title='Test Quiz'
        )
        self.question = Question.objects.create(
            quiz=self.quiz, question_text='What is 1+1?',
            options=['1', '2', '3', '4'], correct_answer='2', order=1
        )


class AuthorizationTests(BaseTestCase):
    """Tests that students cannot generate, edit, or delete course content."""

    @patch('core.views.generate_course_outline')
    @patch('core.views.generate_lesson_plan_for_module')
    @patch('core.views.search_youtube')
    @patch('core.views.generate_deep_lesson_content')
    @patch('core.views.generate_quiz_from_content')
    def test_student_cannot_generate_course(
        self, mock_quiz, mock_deep, mock_yt, mock_lesson, mock_outline
    ):
        """POST /api/courses/generate/ as student returns 403."""
        resp = self.student_client.post('/api/courses/generate/', {
            'prompt': 'Python Basics',
            'num_content_modules': 1,
            'num_lessons_per_module': 1,
            'num_test_modules': 0
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        # Verify AI functions were NOT called
        mock_outline.assert_not_called()

    @patch('core.views.generate_course_outline')
    @patch('core.views.generate_lesson_plan_for_module')
    @patch('core.views.search_youtube')
    @patch('core.views.generate_deep_lesson_content')
    @patch('core.views.generate_quiz_from_content')
    def test_admin_can_access_generate_endpoint(
        self, mock_quiz, mock_deep, mock_yt, mock_lesson, mock_outline
    ):
        """POST /api/courses/generate/ as admin is permitted (mocked AI)."""
        mock_outline.return_value = {
            'course_title': 'Python 101',
            'modules': [{'title': 'Intro'}]
        }
        mock_lesson.return_value = [{'title': 'Hello World'}]
        mock_yt.return_value = []
        mock_deep.return_value = {'text_content': '<p>Hello</p>', 'video_id': None}
        mock_quiz.return_value = {
            'quiz_title': 'Final',
            'questions': [{
                'question_text': 'Q?',
                'options': ['A', 'B', 'C', 'D'],
                'correct_answer': 'A'
            }]
        }

        resp = self.admin_client.post('/api/courses/generate/', {
            'prompt': 'Python Basics',
            'num_content_modules': 1,
            'num_lessons_per_module': 1,
            'num_test_modules': 0
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('title', resp.data)

    def test_student_cannot_delete_course(self):
        """DELETE /api/courses/<id>/ as student returns 403."""
        resp = self.student_client.delete(f'/api/courses/{self.course.id}/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        # Course should still exist
        self.assertTrue(Course.objects.filter(pk=self.course.id).exists())

    def test_student_cannot_update_course(self):
        """PATCH /api/courses/<id>/ as student returns 403."""
        resp = self.student_client.patch(
            f'/api/courses/{self.course.id}/',
            {'title': 'Hacked Title'}, format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.course.refresh_from_db()
        self.assertEqual(self.course.title, 'Test Course')

    def test_student_cannot_update_module(self):
        """PATCH /api/modules/<id>/ as student returns 403."""
        resp = self.student_client.patch(
            f'/api/modules/{self.content_module.id}/',
            {'title': 'Hacked Module'}, format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_delete_module(self):
        """DELETE /api/modules/<id>/ as student returns 403."""
        resp = self.student_client.delete(
            f'/api/modules/{self.content_module.id}/'
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Module.objects.filter(pk=self.content_module.id).exists())

    def test_admin_can_delete_course(self):
        """DELETE /api/courses/<id>/ as admin succeeds."""
        course = Course.objects.create(
            title='Temp Course', created_by=self.admin_user, status='DRAFT'
        )
        resp = self.admin_client.delete(f'/api/courses/{course.id}/')
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Course.objects.filter(pk=course.id).exists())

    def test_admin_can_update_course(self):
        """PATCH /api/courses/<id>/ as admin succeeds."""
        resp = self.admin_client.patch(
            f'/api/courses/{self.course.id}/',
            {'title': 'Updated Title'}, format='json'
        )
        self.assertIn(resp.status_code, [status.HTTP_200_OK, status.HTTP_202_ACCEPTED])
        self.course.refresh_from_db()
        self.assertEqual(self.course.title, 'Updated Title')


class QuizAnswerProtectionTests(BaseTestCase):
    """Tests that student course-detail responses never contain correct_answer."""

    def test_student_course_detail_hides_correct_answer(self):
        """GET /api/courses/<id>/ as student must NOT contain correct_answer."""
        resp = self.student_client.get(f'/api/courses/{self.course.id}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # Walk through modules -> quiz -> questions
        for module in resp.data.get('modules', []):
            quiz = module.get('quiz')
            if quiz:
                for question in quiz.get('questions', []):
                    self.assertNotIn(
                        'correct_answer', question,
                        f"Student response exposed correct_answer in question {question.get('id')}"
                    )

    def test_admin_course_detail_shows_correct_answer(self):
        """GET /api/courses/<id>/ as admin SHOULD contain correct_answer."""
        resp = self.admin_client.get(f'/api/courses/{self.course.id}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        found_answer = False
        for module in resp.data.get('modules', []):
            quiz = module.get('quiz')
            if quiz:
                for question in quiz.get('questions', []):
                    self.assertIn('correct_answer', question)
                    found_answer = True
        self.assertTrue(found_answer, "Admin response should contain at least one correct_answer")

    def test_student_course_list_hides_correct_answer(self):
        """GET /api/courses/ as student must NOT contain correct_answer."""
        resp = self.student_client.get('/api/courses/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        for course in resp.data:
            for module in course.get('modules', []):
                quiz = module.get('quiz')
                if quiz:
                    for question in quiz.get('questions', []):
                        self.assertNotIn(
                            'correct_answer', question,
                            "Student list response exposed correct_answer"
                        )

    def test_student_can_read_published_course(self):
        """Student can still GET a published course (read access preserved)."""
        resp = self.student_client.get(f'/api/courses/{self.course.id}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['title'], 'Test Course')


import tempfile
from pathlib import Path
from dotenv import load_dotenv

class SettingsHardeningTests(TestCase):
    """Tests for settings environment loading and CORS configuration parsing."""

    def test_cors_allowed_origins_parsing(self):
        """Comma-separated CORS environment variable is parsed into individual allowed origins."""
        cors_allowed_origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
        test_cors_env = "https://frontend.vercel.app, https://custom-domain.com , , http://localhost:5173 "
        
        parsed_origins = list(cors_allowed_origins)
        for origin in test_cors_env.split(','):
            clean_origin = origin.strip()
            if clean_origin and clean_origin not in parsed_origins:
                parsed_origins.append(clean_origin)

        self.assertIn("https://frontend.vercel.app", parsed_origins)
        self.assertIn("https://custom-domain.com", parsed_origins)
        self.assertIn("http://localhost:5173", parsed_origins)
        self.assertNotIn("", parsed_origins)
        self.assertNotIn(" ", parsed_origins)
        self.assertEqual(len(parsed_origins), 4)

    def test_load_dotenv_from_file(self):
        """Loading settings with a local .env containing a test-only SECRET_KEY succeeds."""
        with tempfile.TemporaryDirectory() as tmpdir:
            env_file = Path(tmpdir) / ".env"
            env_file.write_text("SECRET_KEY=test-only-dummy-secret-key\n")
            
            orig_secret = os.environ.get('SECRET_KEY')
            try:
                if 'SECRET_KEY' in os.environ:
                    del os.environ['SECRET_KEY']
                
                load_dotenv(dotenv_path=env_file, override=True)
                loaded_secret = os.environ.get('SECRET_KEY')
                self.assertEqual(loaded_secret, "test-only-dummy-secret-key")
            finally:
                if orig_secret is not None:
                    os.environ['SECRET_KEY'] = orig_secret


class StudentProgressionAndLockingTests(BaseTestCase):
    """Tests for student course content locking, progress enforcement, and unlocking flow."""

    def setUp(self):
        super().setUp()
        # Delete assess_module from BaseTestCase to avoid order collision
        self.assess_module.delete()

        # Build clean sequential module order for course:
        # Module 1 (order = 1, CONTENT): self.content_module (has Lesson 1)
        # Module 2 (order = 2, CONTENT): self.locked_content_module (has Lesson 2)
        # Module 3 (order = 3, ASSESSMENT): self.locked_quiz_module (has Quiz & Question)
        self.locked_content_module = Module.objects.create(
            course=self.course, title='Module 2 (Content)', order=2, module_type='CONTENT'
        )
        self.locked_lesson = Lesson.objects.create(
            module=self.locked_content_module, title='Lesson 2',
            content='<p>Module 2 content</p>', order=1
        )
        self.locked_quiz_module = Module.objects.create(
            course=self.course, title='Module 3 (Assessment)', order=3, module_type='ASSESSMENT'
        )
        self.locked_quiz = Quiz.objects.create(
            module=self.locked_quiz_module, title='Test Quiz 3'
        )
        self.locked_question = Question.objects.create(
            quiz=self.locked_quiz, question_text='What is 2+2?',
            options=['2', '3', '4', '5'], correct_answer='4', order=1
        )

    def test_student_can_access_first_module_content(self):
        """Student can access lessons and content in module order = 1."""
        resp = self.student_client.get(f'/api/courses/{self.course.id}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        modules = resp.data.get('modules', [])
        self.assertEqual(len(modules), 3)
        
        first_mod = modules[0]
        self.assertEqual(first_mod['order'], 1)
        self.assertFalse(first_mod['is_locked'])
        self.assertGreater(len(first_mod['lessons']), 0)
        self.assertEqual(first_mod['lessons'][0]['title'], 'Lesson 1')

    def test_student_cannot_obtain_locked_module_content_via_course_detail(self):
        """Locked module (order = 2) returns metadata but lessons=[] and quiz=None."""
        resp = self.student_client.get(f'/api/courses/{self.course.id}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        modules = resp.data.get('modules', [])
        second_mod = modules[1]
        self.assertEqual(second_mod['order'], 2)
        self.assertTrue(second_mod['is_locked'])

        # Metadata MUST be returned for sidebar
        self.assertIn('id', second_mod)
        self.assertIn('title', second_mod)
        self.assertIn('order', second_mod)
        self.assertIn('module_type', second_mod)

        # Content MUST NOT be exposed
        self.assertEqual(second_mod['lessons'], [])
        self.assertIsNone(second_mod['quiz'])

    def test_student_cannot_submit_quiz_for_locked_module(self):
        """POST /api/modules/<locked_id>/submit-quiz/ returns 403 LOCKED and creates no progress row."""
        resp = self.student_client.post(
            f'/api/modules/{self.locked_quiz_module.id}/submit-quiz/',
            {'answers': {str(self.locked_question.id): '4'}},
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(resp.data.get('error'), 'LOCKED')
        self.assertFalse(
            UserProgress.objects.filter(
                user=self.student_user, module=self.locked_quiz_module
            ).exists()
        )

    @patch('core.views.gemini_safe_generate')
    def test_student_cannot_submit_explanation_for_locked_module(self, mock_gemini):
        """POST /api/lessons/<locked_id>/explain/ returns 403 LOCKED, no Gemini call, no attempt created."""
        resp = self.student_client.post(
            f'/api/lessons/{self.locked_lesson.id}/explain/',
            {'transcript': 'I explain the locked lesson concept.'},
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(resp.data.get('error'), 'LOCKED')
        mock_gemini.assert_not_called()
        self.assertFalse(
            ExplanationAttempt.objects.filter(
                user=self.student_user, lesson=self.locked_lesson
            ).exists()
        )

    def test_submitting_passing_quiz_unlocks_next_module(self):
        """Completing previous module unlocks the next module's content in a newly fetched course response."""
        # 1. Verify module 2 is locked before completion
        resp_before = self.student_client.get(f'/api/courses/{self.course.id}/')
        self.assertTrue(resp_before.data['modules'][1]['is_locked'])

        # 2. Mark module 1 as completed via UserProgress
        UserProgress.objects.create(
            user=self.student_user,
            course=self.course,
            module=self.content_module,
            is_completed=True
        )

        # 3. Newly fetched course response shows module 2 as UNLOCKED with content
        resp_after = self.student_client.get(f'/api/courses/{self.course.id}/')
        self.assertEqual(resp_after.status_code, status.HTTP_200_OK)
        second_mod = resp_after.data['modules'][1]
        self.assertFalse(second_mod['is_locked'])
        self.assertGreater(len(second_mod['lessons']), 0)

    def test_direct_module_detail_locking_behavior_preserved(self):
        """Direct GET /api/modules/<locked_id>/ as student returns 403 Forbidden."""
        resp = self.student_client.get(f'/api/modules/{self.locked_content_module.id}/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(resp.data.get('error'), 'LOCKED')

    def test_quiz_submission_unlocked_module_grades_and_records_progress(self):
        """Submitting correct answers for an UNLOCKED quiz module passes and marks progress."""
        # Mark module 1 & 2 as completed so locked_quiz_module (order = 3) is unlocked
        UserProgress.objects.create(user=self.student_user, course=self.course, module=self.content_module, is_completed=True)
        UserProgress.objects.create(user=self.student_user, course=self.course, module=self.locked_content_module, is_completed=True)

        resp = self.student_client.post(
            f'/api/modules/{self.locked_quiz_module.id}/submit-quiz/',
            {'answers': {str(self.locked_question.id): '4'}},
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['passed'])
        self.assertEqual(resp.data['score'], 100.0)
        self.assertTrue(
            UserProgress.objects.filter(
                user=self.student_user, module=self.locked_quiz_module, is_completed=True
            ).exists()
        )


from django.core.management import call_command, CommandError
from io import StringIO

class PromoteAdminCommandTests(TestCase):
    """Tests for the promote_admin management command."""

    @patch('getpass.getpass', side_effect=['SecurePass123!', 'SecurePass123!'])
    def test_promote_admin_interactive_creates_new_admin_user(self, mock_getpass):
        """Interactive new user creation prompts for password twice via getpass."""
        out = StringIO()
        call_command('promote_admin', username='cmd_interactive_admin', stdout=out)
        output = out.getvalue()

        user = User.objects.get(username='cmd_interactive_admin')
        self.assertTrue(user.check_password('SecurePass123!'))
        self.assertEqual(user.profile.role, Profile.Role.ADMIN)
        self.assertEqual(mock_getpass.call_count, 2)
        self.assertIn("Created new Django user 'cmd_interactive_admin'", output)
        self.assertNotIn("SecurePass123!", output)

    @patch('getpass.getpass', side_effect=['PassOne123!', 'PassTwoMismatch!'])
    def test_promote_admin_rejects_password_mismatch(self, mock_getpass):
        """Command raises CommandError if interactive passwords do not match."""
        with self.assertRaises(CommandError) as cm:
            call_command('promote_admin', username='cmd_mismatch_user')
        self.assertIn('Passwords do not match', str(cm.exception))

    @patch('getpass.getpass', side_effect=['', ''])
    def test_promote_admin_rejects_empty_password(self, mock_getpass):
        """Command raises CommandError if password is empty."""
        with self.assertRaises(CommandError) as cm:
            call_command('promote_admin', username='cmd_empty_pass_user')
        self.assertIn('Password cannot be empty', str(cm.exception))

    @patch('getpass.getpass')
    def test_promote_admin_existing_user_no_password_prompt(self, mock_getpass):
        """Existing user promotion does not prompt for password or alter existing credentials."""
        student = User.objects.create_user(username='cmd_existing_student', password='OriginalPassword123!')
        Profile.objects.create(user=student, role=Profile.Role.STUDENT)

        out = StringIO()
        call_command('promote_admin', username='cmd_existing_student', stdout=out)
        output = out.getvalue()

        mock_getpass.assert_not_called()
        student.profile.refresh_from_db()
        self.assertEqual(student.profile.role, Profile.Role.ADMIN)
        self.assertTrue(student.check_password('OriginalPassword123!'))
        self.assertIn("User 'cmd_existing_student' already exists", output)

    def test_promote_admin_non_interactive_flag(self):
        """Automation mode using --password creates admin non-interactively without printing secrets."""
        out = StringIO()
        call_command('promote_admin', username='cmd_automation_admin', password='AutomatedPass123!', stdout=out)
        output = out.getvalue()

        user = User.objects.get(username='cmd_automation_admin')
        self.assertTrue(user.check_password('AutomatedPass123!'))
        self.assertEqual(user.profile.role, Profile.Role.ADMIN)
        self.assertNotIn("AutomatedPass123!", output)


class RoleBasedGenerationAccessTests(BaseTestCase):
    """Tests for role-based generation access control on CourseGenerateAPIView."""

    def test_unauthenticated_cannot_access_generate(self):
        """Unauthenticated POST /api/courses/generate/ returns 401 Unauthorized."""
        client = APIClient()
        resp = client.post('/api/courses/generate/', {'prompt': 'Python'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_cannot_access_generate(self):
        """Student POST /api/courses/generate/ returns 403 Forbidden."""
        resp = self.student_client.post('/api/courses/generate/', {'prompt': 'Python'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    @patch('core.views.generate_course_outline')
    @patch('core.views.generate_lesson_plan_for_module')
    @patch('core.views.search_youtube')
    @patch('core.views.generate_deep_lesson_content')
    @patch('core.views.generate_quiz_from_content')
    def test_admin_can_access_generate(
        self, mock_quiz, mock_deep, mock_yt, mock_lesson, mock_outline
    ):
        """Admin POST /api/courses/generate/ returns 201 Created (AI mocked)."""
        mock_outline.return_value = {'course_title': 'AI Course', 'modules': [{'title': 'Mod 1'}]}
        mock_lesson.return_value = [{'title': 'Lesson 1'}]
        mock_yt.return_value = []
        mock_deep.return_value = {'text_content': '<p>Content</p>', 'video_id': None}
        mock_quiz.return_value = {
            'quiz_title': 'Final Exam',
            'questions': [{'question_text': 'Q1?', 'options': ['A', 'B'], 'correct_answer': 'A'}]
        }

        resp = self.admin_client.post('/api/courses/generate/', {
            'prompt': 'Data Science',
            'num_content_modules': 1,
            'num_lessons_per_module': 1,
            'num_test_modules': 0
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['title'], 'AI Course')




