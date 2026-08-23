# CourseCraft 🎓

CourseCraft is an AI-powered course generation and adaptive learning platform built with Django REST Framework, React, and Google Gemini AI.

## Architecture Stack

- **Backend**: Python 3.12+ / Django 5.x / Django REST Framework
- **Frontend**: React (Vite) Single Page Application
- **Database**: SQLite (local development) / PostgreSQL (production)
- **Authentication**: JWT (JSON Web Tokens via `rest_framework_simplejwt`) with role-based access control (`ADMIN` vs `STUDENT`)
- **AI Engine**: Google Gemini API (`gemini-3.6-flash`) with Feynman technique evaluation
- **Security**: Server-enforced content locking, HTML DOMPurify sanitization, environment secret isolation, and strict role permissions

---

## Local Development Setup

### 1. Environment Configuration

Clone the repository and set up environment variables:

```bash
cd ai-academy
cp .env.example .env
```

Open `ai-academy/.env` and configure your local settings:

```env
SECRET_KEY=your_local_development_secret_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
YOUTUBE_API_KEY=your_youtube_api_key
```

### 2. Backend Setup & Migrations

Create and activate a virtual environment, install backend dependencies, and run database migrations:

```bash
cd ai-academy

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate
```

### 3. Create / Promote Admin User (`promote_admin`)

To bootstrap an admin user safely (idempotent, never prints secrets):

```bash
python manage.py promote_admin --username admin --password "YourAdminPassword123!" --is-superuser
```

### 4. Start Backend Server

```bash
python manage.py runserver
```
The Django REST API will run at `http://127.0.0.1:8000/api/`.

### 5. Frontend Setup & Launch

In a separate terminal window:

```bash
cd ai-academy/ai-academy-react

# Install dependencies
npm ci

# Start Vite development server
npm run dev
```
The React SPA frontend will run at `http://localhost:5173`.

---

## Verification & Testing

### Backend Unit Tests (26 Tests)

```bash
cd ai-academy
python manage.py test core -v2
```

### Frontend Production Build

```bash
cd ai-academy/ai-academy-react
npm run build
```

---

## End-to-End Student Progression Flow

1. **Admin Workflow**:
   - Log in as an `ADMIN` user.
   - Generate or create a multi-module course (`CONTENT` and `ASSESSMENT` types).
   - Set status to `PUBLISHED`.
2. **Student Workflow**:
   - Log in as a `STUDENT` user.
   - Module 1 (`order = 1`) is unlocked (`is_locked = False`); lesson content is viewable.
   - Module 2 (`order = 2`) is locked (`is_locked = True`); lesson content and quiz data are hidden server-side.
   - Complete Module 1 assessment / Feynman challenge.
   - Student view refetches course payload; Module 2 automatically unlocks (`is_locked = False`).
