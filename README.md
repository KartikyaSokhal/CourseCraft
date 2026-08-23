# CourseCraft 🎓

CourseCraft is an AI-powered course generation and adaptive learning platform built with Django REST Framework, React, and Google Gemini AI.

## Project Structure

```text
CourseCraft/
├── README.md
├── docs/
│   ├── project-audit-summary.md
│   └── implementation-notes.md
└── ai-academy/
    ├── backend/
    ├── core/
    ├── ai-academy-react/
    ├── manage.py
    ├── requirements.txt
    ├── build.sh
    ├── .env.example
    └── .gitignore
```

---

## Local Development Setup

### 1. Environment Configuration

Copy the example environment configuration to `.env`:

```bash
cd ai-academy
cp .env.example .env
```

Configure environment variables in `ai-academy/.env`:

```env
SECRET_KEY=your_local_development_secret_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
YOUTUBE_API_KEY=your_youtube_api_key
```

### 2. Backend Setup & Migrations

Create and activate a virtual environment, install backend dependencies, and run database migrations:

```bash
# Create virtual environment inside ai-academy
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run database migrations
python manage.py migrate
```

### 3. Create / Promote Admin User (`promote_admin`)

To bootstrap an admin user safely (securely prompts for password via `getpass`; never prints secrets):

```bash
python manage.py promote_admin --username admin --is-superuser
```

> **Automation Note**: Non-interactive flag `--password <pass>` is supported for automated CI environments only. Avoid using `--password` manually to keep credentials out of shell history.

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

### Django System Check

```bash
cd ai-academy
python manage.py check
```

### Backend Unit Tests (28 Tests)

```bash
cd ai-academy
python manage.py test core -v2
```

### Frontend Production Build

```bash
cd ai-academy/ai-academy-react
npm run build
```
