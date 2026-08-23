# CourseCraft System Architecture & Endpoint Audit Summary

This document summarizes the system architecture, database design, authentication mechanisms, and API endpoint role specifications for CourseCraft.

---

## 1. System Architecture

### Frontend
- **Framework**: React 19 SPA built with Vite and React Router DOM v7.
- **Styling**: Modern Vanilla CSS design system with custom CSS variables and glassmorphic cards.
- **Audio & Speech**: Web Speech API (`SpeechRecognition`) for speech-to-text conversion in Feynman challenge evaluation.
- **Security**: HTML sanitization via `dompurify` prior to rendering AI-generated lesson content.

### Backend
- **Framework**: Python 3.12+ / Django 5.x / Django REST Framework (DRF) 3.16.1.
- **WSGI / Web Server**: Gunicorn 23.0.0 for production deployments.
- **Static Assets**: WhiteNoise static asset serving.

### Database
- **Development**: SQLite 3 (`ai-academy/db.sqlite3`).
- **Production**: PostgreSQL configured via `dj-database-url`.

### Authentication & Authorization
- **Token Mechanism**: JSON Web Tokens (JWT) via `djangorestframework_simplejwt`.
- **Role Hierarchy**: `ADMIN` (course authoring, module generation, full edit access) and `STUDENT` (course enrollment, lesson reading, quiz submission, Feynman challenges).

---

## 2. API Endpoints & Role Access Matrix

| Endpoint | HTTP Methods | Permission Class | Access Rights |
|---|---|---|---|
| `/api/register/` | `POST` | `AllowAny` | Public. Registers a user (`STUDENT` role by default). |
| `/api/token/` | `POST` | `AllowAny` | Public. Returns JWT access and refresh tokens. |
| `/api/token/refresh/` | `POST` | `AllowAny` | Public. Refreshes expired access tokens. |
| `/api/courses/generate/` | `POST` | `[IsAuthenticated, IsAdminUser]` | Restricted to `ADMIN` users. Generates multi-module course using Gemini AI. |
| `/api/courses/` | `GET` | `IsAuthenticated` | `ADMIN` sees all courses; `STUDENT` sees published courses using student-safe serializer. |
| `/api/courses/<id>/` | `GET`, `PUT`, `PATCH`, `DELETE` | `[IsAuthenticated, IsAdminOrReadOnly]` | `GET`: Role-safe payload. `PUT/PATCH/DELETE`: Restricted to `ADMIN`. |
| `/api/courses/<pk>/generate-module/` | `POST` | `[IsAuthenticated, IsAdminUser]` | `ADMIN` only. Generates single content/assessment module. |
| `/api/modules/<id>/` | `GET`, `PUT`, `PATCH`, `DELETE` | `[IsAuthenticated, IsAdminOrReadOnly]` | `GET`: Enforces module locking. `PUT/PATCH/DELETE`: `ADMIN` only. |
| `/api/modules/<id>/submit-quiz/` | `POST` | `IsAuthenticated` | `STUDENT`. Server-side locks check; grades answers and records `UserProgress`. |
| `/api/lessons/<id>/explain/` | `POST` | `IsAuthenticated` | `STUDENT`. Server-side locks check; evaluates Feynman explanation via Gemini. |
| `/api/reviews/` | `GET`, `POST` | `IsAuthenticated` | Authenticated users. GET filters reviews by course; POST submits ratings. |
