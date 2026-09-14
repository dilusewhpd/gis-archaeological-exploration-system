# Running the full stack

Four processes, started in this order. Each needs its own terminal.

| # | Process              | Port  | Directory         |
|---|----------------------|-------|--------------------|
| 1 | PostgreSQL           | 5432  | (system service)   |
| 2 | Python risk service  | 8000  | project root       |
| 3 | Node backend         | 3000  | `central-backend/` |
| 4 | Next.js frontend     | 3001+ | `frontend/`        |

## 1. PostgreSQL

Make sure your local PostgreSQL server is running and reachable at the
connection string in `central-backend/.env` (`DATABASE_URL`) — by default a
database named `gis_archaeological_db` on `localhost:5432`. How you start it
depends on your install (Windows service, `pg_ctl start`, etc.) — this repo
doesn't run Postgres itself.

First-time setup only:

```bash
cd central-backend
pnpm exec prisma db push       # sync the schema
pnpm exec prisma db seed       # seed sample users/data
```

## 2. Python risk service

From the project root (`risk_model.joblib` and `risk_service.py` live here):

```bash
pip install -r requirements.txt
uvicorn risk_service:app --host 0.0.0.0 --port 8000
```

Verify it's up: `GET http://localhost:8000/health` → `{"status":"ok","model_loaded":true}`.

This is a separate process from the Node backend — if it isn't running,
`GET /api/sites/:id/risk` on the Node backend returns a clear
"Risk assessment service is currently unavailable" error instead of hanging,
so it's safe to leave it stopped when you're not testing risk assessment.

## 3. Node backend (central-backend)

```bash
cd central-backend
pnpm install     # first time only
pnpm run dev
```

Runs on `http://localhost:3000`. Reads `RISK_SERVICE_URL` from `.env`
(defaults to `http://localhost:8000` if unset).

## 4. Next.js frontend

```bash
cd frontend
pnpm install     # first time only
pnpm run dev
```

Runs on `http://localhost:3000` by default but Next.js will pick the next
free port (3001, 3002, …) if that one's taken by the backend — check the
terminal output for the actual URL. Reads `NEXT_PUBLIC_API_BASE_URL` from
`frontend/.env.local` (defaults to `http://localhost:3000`, i.e. the Node
backend).

## Demo checklist

- [ ] Postgres running
- [ ] `uvicorn risk_service:app --port 8000` running (for risk assessment / GIS features)
- [ ] `central-backend`: `pnpm run dev` (port 3000)
- [ ] `frontend`: `pnpm run dev` (prints its own port)
