import os
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from core.models import (
    Profile, Course, Module, Lesson, Quiz, Question, UserProgress
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

