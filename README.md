# Formcraft — a Typeform clone

A full-stack, production-quality clone of Typeform: a drag-and-drop form builder, a full-screen conversational respondent experience, and a results/analytics dashboard with charts and CSV export.

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui-style components, Framer Motion, dnd-kit, React Hook Form + Zod, TanStack Query, Axios, Sonner
- **Backend:** FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic, SQLite

---

## Table of contents

1. [Quick start](#quick-start)
2. [Architecture](#architecture)
3. [Folder structure](#folder-structure)
4. [Database schema](#database-schema)
5. [API reference](#api-reference)
6. [Design decisions & tradeoffs](#design-decisions--tradeoffs)
7. [Screenshots](#screenshots)
8. [Deployment](#deployment)
9. [Future improvements](#future-improvements)

---

## Quick start

### Prerequisites

- Python 3.10+
- Node.js 20+
- npm

### 1. Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Create the schema
alembic upgrade head

# Seed 4 forms + 30+ mixed-type responses
python -m app.seed.seed_data

uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000`. Interactive docs (Swagger UI) are at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000` — you'll land on the dashboard with 4 seeded forms (3 published, 1 draft), ready to explore.

### Try it end to end

1. Open the **Customer Feedback** form in the builder, tweak a question, watch the live preview update.
2. Click **Preview** to test the full respondent flow (keyboard nav: `Enter`, `↑`/`↓`).
3. Click **Copy link** and open the link in a new tab to submit a real response as a respondent.
4. Go to **Results** to see the response land in the table and shift the summary charts.

---

## Architecture

```
┌─────────────────────┐        REST/JSON        ┌──────────────────────┐
│   Next.js frontend   │ ───────────────────────▶│   FastAPI backend    │
│  (App Router, React) │ ◀─────────────────────── │  (SQLAlchemy + SQLite)│
└─────────────────────┘                          └──────────────────────┘
        │                                                    │
        ▼                                                    ▼
  TanStack Query cache                              SQLite file (typeform_clone.db)
  (optimistic updates,                              managed via Alembic migrations
   request de-duplication)
```

The two apps are fully decoupled and only communicate over HTTP — the frontend never talks to the database directly. This is what lets each side be deployed independently (Vercel for the frontend, Render/Railway for the backend) and lets either be swapped out (e.g. SQLite → Postgres) without touching the other.

**Why this split:**

- **FastAPI + SQLAlchemy + Pydantic** gives strong request/response typing end-to-end (Pydantic schemas are the single source of truth for the API contract, validated automatically on every request) with minimal boilerplate, and auto-generated OpenAPI docs for free.
- **TanStack Query** on the frontend means the UI is never manually managing loading/error/cache state — every mutation (create question, reorder, publish, etc.) declares its own optimistic update and rollback, so the builder feels instant without a hand-rolled state layer.
- **SQLite** per the spec: zero setup, a single file, perfect for this scope. The schema is written to be swapped to Postgres by changing one environment variable (see [Tradeoffs](#design-decisions--tradeoffs)) — SQLAlchemy's ORM layer doesn't change.

---

## Folder structure

```
typeform-clone/
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI routers: forms, questions, public, responses
│   │   ├── models/         # SQLAlchemy ORM models (Form, Question, Response, Answer)
│   │   ├── schemas/        # Pydantic request/response contracts
│   │   ├── services/       # Business logic, one module per resource
│   │   ├── database/       # Engine, session, declarative base
│   │   ├── seed/           # Demo data generator
│   │   ├── utils/          # Slug generation, small helpers
│   │   └── main.py         # App factory, CORS, router registration
│   ├── alembic/             # Migrations
│   └── requirements.txt
│
└── frontend/
    ├── app/
    │   ├── dashboard/            # Form list
    │   ├── builder/[id]/         # 3-pane form builder
    │   ├── form/[slug]/          # Public respondent flow (no auth)
    │   ├── responses/[id]/       # Single response detail
    │   └── analytics/[id]/       # Summary stats + responses table
    ├── components/
    │   ├── builder/         # Sidebar, editor, live preview, DnD
    │   ├── dashboard/       # Form cards, dialogs
    │   ├── respondent/      # Shared question-by-question flow (used by both
    │   │                      the public page and the builder's preview modal)
    │   ├── results/         # Stat cards, breakdown bars, responses table
    │   ├── shared/          # Empty states, confirm dialog, theme toggle
    │   └── ui/              # shadcn/ui-style primitives (button, dialog, etc.)
    ├── hooks/               # TanStack Query hooks + small utility hooks
    ├── lib/                 # API client, query keys, CSV export, formatting
    ├── services/            # Typed API functions (one per backend resource)
    └── types/               # TypeScript types mirroring the Pydantic schemas
```

**Why `components/respondent/` is shared:** the builder's "Preview" modal and the real public `/form/[slug]` page render the *exact* same `RespondentFlow` component — one in `preview` mode (no network submission), one live. This guarantees the preview is never out of sync with what a real respondent sees, and it's the single place all the keyboard/animation/validation logic lives.

---

## Database schema

```
┌────────────┐        ┌─────────────┐        ┌────────────┐        ┌───────────┐
│   forms    │ 1    N │  questions  │        │ responses  │ 1    N │  answers  │
├────────────┤◀───────├─────────────┤        ├────────────┤◀───────├───────────┤
│ id (PK)    │        │ id (PK)     │        │ id (PK)    │        │ id (PK)   │
│ title      │        │ form_id (FK)│        │ form_id(FK)│        │response_id│(FK)
│ status     │        │ type        │        │submitted_at│        │question_id│(FK)
│ slug       │        │ title       │        │ is_complete│        │ value(JSON│
│created_at  │        │ description │        └─────┬──────┘        └───────────┘
│updated_at  │        │ required    │              │                     ▲
└─────┬──────┘        │ position    │              │                     │
      │               │ settings    │              └─────────────────────┘
      │ 1    N         │  (JSON)     │                answers reference both
      └───────────────▶└─────────────┘                response AND question
```

| Table | Purpose | Notable columns |
|---|---|---|
| `forms` | One form/survey | `slug` (public, url-safe, independent of `id`) · `status` (`draft`/`published`) |
| `questions` | Ordered questions on a form | `position` (dense 0-based order, source of truth for both builder and respondent ordering) · `settings` (JSON — holds `choices` for multiple_choice/dropdown, `max` for rating scale, `placeholder` for text types) |
| `responses` | One respondent's submission | `is_complete` (distinguishes a finished submission from a partial one — powers the completion-rate/partial-responses bonus feature without a separate table) |
| `answers` | One question's answer within a response | `value` (JSON — holds a string, number, or boolean depending on question type, without needing per-type columns) |

**Relationships:** `Form 1—N Question`, `Form 1—N Response`, `Response 1—N Answer`, `Question 1—N Answer`. All child rows cascade-delete with their parent (deleting a form removes its questions and responses; deleting a response removes its answers).

**Why JSON columns for `settings` and `value`:** the 8 question types have different, non-overlapping configuration and answer shapes (a rating's `max` scale vs. a multiple-choice's `choices` list vs. a plain string). A sparse table with a column per possible field would need a migration every time a new question type is added; JSON keeps the schema stable while remaining fully queryable in Python for the stats endpoint.

---

## API reference

All routes are prefixed with `/api`. Full interactive docs at `/docs` (Swagger) once the backend is running.

### Forms

| Method | Path | Description |
|---|---|---|
| `GET` | `/forms` | List all forms with computed response counts |
| `POST` | `/forms` | Create a new draft form |
| `GET` | `/forms/{id}` | Get a form with its ordered questions |
| `PUT` | `/forms/{id}` | Rename / change status |
| `DELETE` | `/forms/{id}` | Delete a form and everything under it |
| `POST` | `/forms/{id}/duplicate` | Deep-copy a form's questions into a new draft |
| `POST` | `/forms/{id}/publish` | Publish (requires ≥1 question) |
| `POST` | `/forms/{id}/unpublish` | Revert to draft; existing responses are kept |

### Questions

| Method | Path | Description |
|---|---|---|
| `POST` | `/questions` | Add a question to a form |
| `PUT` | `/questions/{id}` | Update title, description, required, type, or settings |
| `DELETE` | `/questions/{id}` | Delete a question (remaining positions are re-packed) |
| `PUT` | `/questions/reorder` | Bulk-update `{ id, position }` pairs after a drag-and-drop |

### Public (no auth)

| Method | Path | Description |
|---|---|---|
| `GET` | `/public/{slug}` | Fetch a published form for the respondent flow |
| `POST` | `/public/{slug}/submit` | Submit answers; 403 if the form isn't published |

### Responses

| Method | Path | Description |
|---|---|---|
| `GET` | `/forms/{id}/responses` | List responses for a form (with answer counts) |
| `GET` | `/responses/{id}` | Get one response with all its answers |
| `GET` | `/forms/{id}/stats` | Aggregated stats per question: choice breakdowns, rating histograms, numeric averages, or sample text answers |

---

## Design decisions & tradeoffs

- **SQLite over Postgres.** Matches the spec exactly and needs zero setup for a reviewer to run locally. The tradeoff: SQLite doesn't handle concurrent writers well, so it isn't the right choice for a real multi-user production deployment. Because the code goes through SQLAlchemy's ORM rather than raw SQL, moving to Postgres in a real deployment is a one-line `DATABASE_URL` change plus re-running Alembic migrations — no application code changes needed.

- **Slugs are separate from primary keys.** `Form.slug` is a random, short, url-safe string distinct from `Form.id`. This means the shareable public link never leaks the internal database ID, and a form could get a fresh slug (regenerating its share link) without changing its identity — useful if a link ever needs to be invalidated.

- **Optimistic updates in the builder, not the respondent flow.** The builder mutations (question update/delete/reorder) apply the change to the TanStack Query cache immediately and roll back on error, so editing feels instantaneous. The respondent flow deliberately does *not* optimistically "submit" — the thank-you screen only shows after the server confirms the write, since losing a real response silently would be worse than a half-second delay.

- **JSON `settings`/`value` columns over per-type tables.** Discussed above under [Database schema](#database-schema) — the tradeoff is that these columns aren't validated at the database level (a malformed `settings` blob wouldn't be caught by a `CHECK` constraint), so all shape validation happens in the Pydantic schemas and frontend types instead.

- **No authentication**, per the spec — anyone with the API base URL can hit the builder endpoints. In a real product this would sit behind session auth scoped to a workspace/owner; the service layer is already structured (one function per operation) so adding an `owner_id` filter to each query would be a contained change.

- **Question `position` is a dense integer**, re-packed on every delete, rather than a linked list or fractional index. Simpler to reason about and fast enough at the scale a single form's question list will ever reach; a fractional-index scheme would only pay off if reordering needed to avoid touching every row.

---

## Screenshots

> _Add screenshots here before sharing outside the team:_
- `docs/screenshot-dashboard.png` — dashboard with form cards, status badges, search
- `docs/screenshot-builder.png` — 3-pane builder (sidebar / editor / live preview)
- `docs/screenshot-respondent.png` — full-screen respondent flow mid-question
- `docs/screenshot-thankyou.png` — thank-you screen
- `docs/screenshot-analytics.png` — summary stats with breakdown charts

---

## Deployment

### Frontend → Vercel

1. Push the repo to GitHub.
2. Import the `frontend/` directory as the Vercel project root.
3. Set the environment variable `NEXT_PUBLIC_API_URL` to your deployed backend's URL (e.g. `https://your-api.onrender.com/api`).
4. Deploy — Vercel auto-detects Next.js.

### Backend → Render or Railway

1. Create a new **Web Service** pointing at the `backend/` directory.
2. Build command: `pip install -r requirements.txt`
3. Start command: `alembic upgrade head && python -m app.seed.seed_data && uvicorn app.main:app --host 0.0.0.0 --port $PORT` (drop the seed step after the first deploy so it doesn't wipe real data — see the warning in `seed_data.py`).
4. Set environment variable `CORS_ORIGINS` to your deployed frontend's origin (e.g. `https://your-app.vercel.app`).
5. **Persistent disk:** SQLite's file needs to live on a persistent volume on these platforms (both Render and Railway support attaching one), otherwise the database resets on every redeploy. Point `DATABASE_URL` at a path on that volume, e.g. `sqlite:////data/typeform_clone.db`.

---

## Future improvements

- **Logic branching** — conditional "jump to question X if answer is Y" (explicitly out of scope for this pass, per the assignment's allowed placeholders)
- **Integrations** — Slack/webhook notifications on new response, Zapier/Make connectors
- **Teams & multi-user auth** — workspaces, shared form ownership, roles
- **Payments** — collecting payment as part of a form flow
- **File upload question type**
- **Real-time collaboration** in the builder (multiple editors on the same form)
- **A/B testing** of question wording via variants
- Move from SQLite to Postgres with connection pooling for concurrent production traffic
