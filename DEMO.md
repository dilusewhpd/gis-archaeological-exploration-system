# Demo walkthrough

A ~7–10 minute script touching every major feature once. Follow **[RUNNING.md](RUNNING.md)**
to get all four processes up first.

## Demo accounts

One account per role, already seeded in the dev database:

| Role | Email | Password |
|---|---|---|
| Field Officer | `diluni@gmail.com` | `Gl4*C1@3Zz` |
| Senior Officer | `senior.officer@doa.lk` | `aG@j&u2JHJ` |
| Analyst | `analyst@doa.lk` | `Y5a#*sP1@V` |
| Admin | `admin@example.com` | `Hg6#&uBlbf` |

(Each account has `mustChangePassword` set, but that's informational only —
it doesn't block login.)

## Script

### 1. Field Officer — register a site (~90s)

1. Log in as the Field Officer.
2. Point out the dashboard's live site counts.
3. **Submit report** → fill the form (any real-sounding values work — e.g.
   site code `SITE-DEMO-01`, name "Demo Viva Site", province Central,
   district Kandy, historical period Kandyan, site type Temple).
4. Click on the GPS location box to drop a pin (or type coordinates
   manually) — point out the on-land validation.
5. Attach a photo (optional) and click **Submit for Approval** — the site
   is created and immediately moved to `PENDING` in one step.
6. Open **My sites** and show it listed as *Pending review*.

### 2. Senior Officer — review queue (~60s)

1. Log out, log in as the Senior Officer.
2. Point out the **Review & Approval Queue** counts (Awaiting / Approved / Rejected).
3. Open the site just submitted → **Approve site**.
4. Scroll down to the workflow history timeline — show the full audit trail
   (`Created → Submitted → Approved`).
5. Mention the reject path exists too, without re-running it live — e.g.
   open **Sri Dalada Maligawa (Temple of the Tooth) Annex Survey**, which is
   sitting `REJECTED` with a real rejection reason from earlier testing.

### 3. Analyst — map & risk (~90s)

1. Log out, log in as the Analyst.
2. Dashboard — point out the breakdowns by status / site type / historical
   period / province.
3. **GIS map** — real OpenStreetMap tiles via Leaflet, colored markers by
   status, click a marker for its popup, try the status filter.
4. **Risk assessment** — click **Assess risk** on an approved site (e.g.
   Sigiriya or Galle Fort). Point out the percentage + Low/Medium/High badge
   shown together, the probability breakdown under "Details", and the
   `model_note` disclaimer text — this is a heuristic exposure indicator
   from a trained Random Forest classifier, not a verified damage
   prediction.
   - If the Python risk service isn't running, this is also a good moment
     to show the graceful "Risk assessment service is currently
     unavailable" message instead of a crash.

### 4. Admin — user management (~60s)

1. Log out, log in as the Admin.
2. Dashboard stats (mirrors the analyst's, plus user count).
3. **Users** → **Add user** → create a throwaway account (any role) →
   point out the temporary password shown exactly once on the success
   screen — the backend generates it, never the client.
4. Back on the list, **Reset Pass** on any user to show a fresh temporary
   password generated live.
5. Mention GIS map and Risk assessment are the same views the analyst just
   saw — no need to re-demo.

### 5. Wrap-up talking points (~30s)

- Three independent processes: Next.js frontend, Node/Express backend,
  Python (FastAPI + scikit-learn) risk-model service — a polyglot setup, not
  a monolith.
- Every role's dashboard is route-protected; logging out clears the session
  in every open tab immediately (cross-tab sync).
- Known limitations, if asked: site/user list endpoints cap at 100 results
  (fine at current scale, would need pagination UI past that); the risk
  score is a heuristic indicator, explicitly labelled as such in the UI.
