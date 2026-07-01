# Aurora Tasks — To-Do, Calendar & LINE Reminder (Notion + AI)

Reference implementation of the architecture in
`../System_Architecture_Design_To-Do_List,_Calendar_&_LINE_Reminder_with_Notion_and_AI.docx`.
Each folder below is one component from that diagram and can be deployed independently.

```
app/
  frontend/          React + Vite + TS + Tailwind — "Rainbow Pastel Liquid Glass" UI
  backend/           Node.js + Express + TS — API gateway, Notion CRUD, LINE proxy, auth
  ai-module/         Python + FastAPI + Gemini — email/LINE NLP, task extraction
  notion-schemas/    Notion "create database" payloads for Tasks/Categories/Users/Logs
  scheduler/         Cloud Scheduler (Terraform) + local-dev cron fallback
```

## Why Node/Express for the backend, not Python?

The frontend is already TypeScript, and both Notion (`@notionhq/client`) and
LINE (`@line/bot-sdk`) publish first-class JS/TS SDKs, so the API gateway
gets full type-safety across the request/response boundary with the
frontend for free. Python is reserved for the AI module, where its NLP/LLM
ecosystem (google-generativeai, pypdf, python-docx) is the deciding factor —
splitting the two means each service uses the stack best suited to its job
instead of forcing one language to do both.

## Running locally

```bash
# 1. Frontend
cd frontend && npm install && npm run dev        # http://localhost:5173

# 2. Backend (copy .env.example -> .env and fill in Notion/LINE secrets first)
cd backend && npm install && npm run dev         # http://localhost:4000

# 3. AI module (copy .env.example -> .env and fill in GEMINI_API_KEY)
cd ai-module && pip install -r requirements.txt
uvicorn main:app --reload --port 8000            # http://localhost:8000

# 4. Notion databases (one-time): POST each notion-schemas/*.json to
#    https://api.notion.com/v1/databases, Categories first (Tasks/Logs
#    reference it by id), then paste the resulting ids into backend/.env

# 5. Scheduler (local dev only — see scheduler/local-dev-cron.ts)
npx tsx scheduler/local-dev-cron.ts
```

## Request flow

1. **User** interacts with the **Frontend** (Dashboard, Calendar, Task form, Settings).
2. **Frontend** calls the **Backend API** (`/api/*`) over JSON/HTTPS with a JWT.
3. **Backend** reads/writes the **Notion** databases (Tasks, Categories, Users, Logs)
   via `backend/src/services/notionService.ts`.
4. **LINE** webhooks land on `POST /line/webhook`; text messages are forwarded to the
   **AI Processing Module**, postbacks (e.g. "Mark as done") are applied directly to Notion.
5. The **AI module** extracts structured tasks with Gemini (`nlp_extractor.py`) from
   LINE text or scanned email (`email_connector.py` + `attachment_parser.py`), then
   calls back into the Backend's `/internal/ai/tasks` endpoint to persist them.
6. The **Scheduler Service** hits `/internal/reminders/sweep` (Backend) and
   `/scan/emails` (AI module) on a timer, driving LINE Flex Message reminders and
   periodic inbox scans respectively.

## Security notes

- `/api/*` requires a user JWT (`requireAuth`); `/internal/*` requires a shared
  `x-internal-key` header (`requireInternalKey`) since the Scheduler and AI module
  have no user session.
- The LINE webhook is verified via HMAC signature (`@line/bot-sdk`'s `middleware()`),
  not JWT — LINE's platform is the caller, not a logged-in user.
- Store `NOTION_API_KEY`, `LINE_CHANNEL_ACCESS_TOKEN`, `GEMINI_API_KEY`, and
  `JWT_SECRET`/`INTERNAL_API_KEY` in your platform's secret manager (GCP Secret
  Manager / AWS Secrets Manager) in any real deployment — the `.env.example` files
  here are for local dev only.

## Deployment strategy

| Component      | Suggested target                              | Notes |
|-----------------|------------------------------------------------|-------|
| Frontend        | Cloudflare Workers (static assets)              | `npm run build` outputs a static `dist/`; see below |
| Backend         | Cloud Run / ECS Fargate (Docker) or Cloud Functions | Stateless — scales to zero between requests |
| AI module       | Cloud Run (Docker) — separate service from backend | Isolate LLM/API-quota blast radius from the user-facing API |
| Notion          | Managed by Notion — no deployment needed        | Rate limits (~3 req/s) matter at scale; add a cache layer if needed |
| Scheduler       | Cloud Scheduler (see `scheduler/cloud-scheduler.tf`) | Or AWS EventBridge Scheduler equivalent |

### Deploying the frontend (Cloudflare Workers, static assets)

Live at Cloudflare dashboard → Workers & Pages → **todolist**, git-connected to
`rachanonskln/todolist` — every push to `main` triggers a build + `npx wrangler deploy`
on Cloudflare's own infrastructure (Settings → Build). No GitHub Actions involved; keep
`frontend/wrangler.toml`'s `name` in sync with the project name shown there. Build
settings on the Cloudflare side:

| Setting | Value |
|---|---|
| Root directory | `To do list/app/frontend` |
| Build command | `npm install && npm run build` |
| Deploy command | `npx wrangler deploy` |

If the backend later gets a public URL (e.g. a Cloud Run URL), set `VITE_API_BASE_URL`
as a build variable on the Cloudflare project (Settings → Build → Variables and secrets)
so the frontend stops assuming same-origin `/api`.

The backend and AI module aren't on Cloudflare — Express and FastAPI don't run natively
on Workers' runtime, so they stay on Cloud Run (or equivalent) as described above.

## Design system: "Rainbow Pastel Liquid Glass"

Implemented in `frontend/tailwind.config.ts` (color tokens, gradients, keyframes) and
`frontend/src/index.css` (`.app-background`, `.glass-panel`, `.glass-card`, `.glass-button`,
`.glass-input`). The look is: pastel hues swept across a slow-animating rainbow gradient,
under translucent `backdrop-blur` panels with a soft inner highlight to read as glass.
Motion is kept subtle — `framer-motion` fade/slide-ins on cards, floating background blobs,
a shimmering skeleton loader — so it reads as polish rather than distraction.

## Internationalization

The UI is bilingual (Thai default, English toggle in the top-right of the Navbar).
Translation strings live in `frontend/src/i18n/translations.ts`; `LocaleContext.tsx`
provides the `useLocale()` hook (`{ locale, setLocale, t }`) and persists the choice to
`localStorage`. Calendar month/weekday names use `date-fns`'s `th`/`enUS` locales so dates
format correctly in both languages. To add a string, add the key to both `en` and `th`
objects in `translations.ts` — TypeScript will error on any page using a key missing from
either language.
