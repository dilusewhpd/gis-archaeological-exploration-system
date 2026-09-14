# GIS Archaeological Exploration System

A GIS-based exploration data management and risk assessment platform for the
Department of Archaeology, Sri Lanka. It replaces paper-based site
registration with a role-gated digital workflow: field officers register
exploration sites, senior officers review and approve or reject them, and
analysts and admins get a spatial map and a model-scored exposure-risk view
over the approved set.

## What it does

- **Site registration & review workflow** — a field officer creates a site
  (with GPS coordinates and photos) as a draft, submits it for review, and a
  senior officer approves or rejects it with a reason. Rejected sites can be
  revised and resubmitted. Every transition is recorded in an audit trail
  (`SiteWorkflowHistory`).
- **GIS map** — every role sees registered sites plotted on a real
  OpenStreetMap map (via Leaflet), filterable by status, with per-site detail
  popups.
- **Risk assessment** — approved sites can be scored on demand by a trained
  Random Forest classifier (elevation, coastal proximity, climate zone) that
  runs as a separate Python microservice. The result is a heuristic exposure
  indicator, not a verified damage prediction, and the UI says so.
- **User management** (admin) — provision accounts, assign one of four
  roles, deactivate/reactivate, and reset passwords.

## Roles

| Role | Can do |
|---|---|
| Field Officer | Register sites, upload photos, submit for review, edit/resubmit their own draft or rejected sites |
| Senior Officer | Review the queue of submitted sites, approve or reject (with a reason) |
| Analyst | Read-only dashboard, GIS map, risk assessment over all sites |
| Admin | Everything analysts see, plus user account management |

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, react-leaflet |
| Backend | Node.js, Express 5, TypeScript, Prisma 7 (PostgreSQL), Zod validation, JWT auth |
| Risk model service | Python, FastAPI, scikit-learn (Random Forest), served via uvicorn |
| Database | PostgreSQL |

## Architecture

Three independent processes talk over HTTP — a polyglot setup, not a
monolith:

```
Next.js frontend  --HTTP-->  Node/Express backend  --HTTP-->  Python risk service
   (port 3001)                   (port 3000)                    (port 8000)
                                       |
                                  PostgreSQL
                                  (port 5432)
```

The Node backend is layered conventionally:

```
routes -> middlewares (auth, role check, Zod validation) -> controllers -> services -> Prisma
```

Every thrown error is one of a small set of typed `AppError` subclasses
(`NotFoundError`, `ForbiddenError`, `BusinessRuleError`,
`ServiceUnavailableError`, …) caught by a single error-handling middleware —
never a raw `Error`, so every API failure returns a consistent
`{ success: false, message }` shape with the right HTTP status.

The frontend mirrors the backend's role split: each role has its own route
tree (`/field_officer/dashboard/*`, `/senior_officer/dashboard/*`, etc.)
behind a `ProtectedRoute` component that checks the authenticated user's role
before rendering, backed by a JWT stored in `localStorage` and kept in sync
across browser tabs.

## Getting started

Four processes need to be running for the full app. See **[RUNNING.md](RUNNING.md)**
for exact startup commands, ports, and environment variables.
