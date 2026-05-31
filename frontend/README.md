Sentinel AI — Frontend

This is the Next.js (App Router) frontend for Sentinel AI. It connects to the existing FastAPI backend using the centralized API layer.

Quick setup

1. Copy environment variables:

```bash
cp frontend/.env.example .env.local
```

2. Install dependencies and run the dev server:

```bash
cd frontend
npm install
npm run dev
```

3. Start the backend (from repo root):

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Environment

- `NEXT_PUBLIC_API_BASE_URL` — Base URL for the FastAPI backend (default `http://localhost:8000`).

Features implemented

- Centralized API layer: `services/api.ts`
- Auth provider with JWT persistence: `providers/auth-provider.tsx`
- Route protection using middleware and `AuthGuard`
- React Query for all API calls
- Pages: landing, create-user, login, dashboard, incidents, incident detail, logs, team chat, settings
- Reusable UI components and skeletons in `components/`

If you want, I can run a quick connectivity test to your backend now.
