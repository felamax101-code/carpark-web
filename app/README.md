# Smart Car Parking System — Frontend

Next.js (App Router) + TypeScript + Tailwind frontend for the Smart Car
Parking System, consuming the Django REST Framework backend.

## Setup

```bash
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm install
npm run dev
```

Runs on http://localhost:3000 by default. The backend is expected on a
different origin (see NEXT_PUBLIC_API_URL) — CORS and cookies are
already configured for that on the Django side.

## Structure

- `lib/api.ts` — axios instance; attaches the access token to requests
  and silently refreshes it on a 401 using the httpOnly refresh cookie.
- `lib/token.ts` — in-memory access token store (not localStorage).
- `lib/auth.ts`, `context/AuthContext.tsx` — login/register/logout and
  the global `user` state (`useAuth()`).
- `lib/parking.ts`, `lib/sessions.ts`, `lib/payments.ts` — typed calls
  to the parking/sessions/payments Django apps.
- `components/ProtectedRoute.tsx` — client-side auth + role guard,
  used to wrap each page below.
- `app/login`, `app/register` — auth pages.
- `app/availability` — live slot board (polls every 5s), any role.
- `app/gate` — entry/exit/payment desk, ADMIN + GATE_OPERATOR only.
- `app/admin` — manage slots and tariff bands, ADMIN only.

## Auth model (matches the backend)

Access token: returned in the JSON body on login/register/refresh, kept
in memory only, sent as `Authorization: Bearer <token>`. Refresh token:
httpOnly cookie, scoped to `/api/auth/`, only read by the backend's
refresh endpoint — this file never touches it directly.