# Sentinel AI

A full-stack incident management dashboard built with FastAPI on the backend and Next.js App Router on the frontend.

## Repository Structure

- `backend/` - FastAPI backend
- `frontend/` - Next.js frontend
- `sentinel_env/` - Python virtual environment

## Setup

### Backend

1. Activate the Python virtual environment:

```powershell
cd backend
..\sentinel_env\Scripts\Activate.ps1
```

2. Install dependencies if needed:

```powershell
pip install -r requirements.txt
```

3. Run the backend server:

```powershell
uvicorn app.main:app --reload --port 8000
```

### Frontend

1. Install Node dependencies:

```powershell
cd frontend
npm install
```

2. Create environment variables:

```powershell
copy .env.example .env.local
```

3. Start the frontend dev server:

```powershell
npm run dev
```

4. Open `http://localhost:3000`

## Environment

The frontend uses `NEXT_PUBLIC_API_BASE_URL` to connect to the backend. Example:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Notes

- Authentication uses JWT tokens stored in localStorage and a cookie.
- The frontend is built with React Query, Zod, React Hook Form, Tailwind CSS, shadcn/ui, and Lucide icons.
- The backend endpoints are used directly; there is no mock data.

## Git Ignore

Root `.gitignore` covers:

- `sentinel_env/`
- `node_modules/`
- `.env` files
- `.next/`
- system/editor files

## Verified

- Backend API connectivity has been confirmed.
- Frontend build passes successfully with `npm run build`.
