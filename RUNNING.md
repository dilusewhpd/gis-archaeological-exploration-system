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
pnpm exec prisma db seed       # seeds the 4 Role rows only — no users, no sites
```

**There is no self-service registration and no seeded admin account** — accounts
are only created by an existing admin (`POST /api/users`), which is a
chicken-and-egg problem on a brand new database. To bootstrap the first admin
account, run this once from `central-backend/`:

```bash
node -e "
require('dotenv/config');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
(async () => {
  const role = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);
  const user = await prisma.user.create({
    data: { firstName: 'Admin', lastName: 'User', email: 'admin@example.com', passwordHash, roleId: role.id, mustChangePassword: true },
  });
  console.log('Created admin:', user.email, '/ ChangeMe123!');
  await prisma.\$disconnect();
})();
"
```

Log in with that account, then use **Admin → Users** in the app to create
everyone else (each new account gets a generated temporary password shown
once on screen).

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
- [ ] `uvicorn risk_service:app --port 8000` running (only needed for the Risk Assessment page — the rest of the app, including the GIS map, works fine without it)
- [ ] `central-backend`: `pnpm run dev` (port 3000)
- [ ] `frontend`: `pnpm run dev` (prints its own port)

See **[DEMO.md](DEMO.md)** for a walkthrough script covering every major
feature, and the current demo accounts (one per role) to log in with.
