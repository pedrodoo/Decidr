# Decidr

Good decisions that die for lack of translation into business language.

A decision logging tool for designers who report to non-design leadership. You put in the context (the problem, the options, the data, the tradeoffs) and it helps you think it through and communicate it clearly. 
One input, three outputs.

## What it does

- **Prepare Decision** - structures your reasoning before you commit. For you, not for them.
- **Communicate to Leadership** - translates the decision into exec-ready language tied to business metrics. CEO register by default.
- **Portfolio Case** - narrates the decision as a structured case study for interviews and portfolio work.

## Tech stack

SvelteKit · Neon · Drizzle ORM · Better Auth · Anthropic API

## Getting started

Create a `.env` file in the project root (see [Environment variables](#environment-variables) below), then:

```bash
pnpm install
pnpm dev
```

App runs at `localhost:5173`.

## Environment variables

Required for local development:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon Postgres connection string (required by Drizzle; app throws if unset). |
| `ORIGIN` | Public base URL of the app (e.g. `http://localhost:5173`). Used as Better Auth `baseURL` for cookies and redirects. |
| `BETTER_AUTH_SECRET` | Secret for Better Auth session signing ([docs](https://www.better-auth.com/docs/installation)). |
| `ANTHROPIC_API_KEY` | Anthropic API key for `POST /api/decisions/generate`. |

## Project structure

```
src/
  lib/
    components/           # Reusable UI used on /decisions/new
      AudienceGate.svelte
      AudienceIndicator.svelte
      StepProgress.svelte
      CoachResponse.svelte
    server/               # Auth (Better Auth) + DB (Drizzle)
      auth.ts
      db/index.ts
      db/schema.ts
      db/auth.schema.ts   # Better Auth–generated
    strings.js            # App copy (audience gate, new decision, coach content)
    design-tokens.css     # Design primitives + semantic tokens
  routes/
    +page.svelte          # Home / landing
    +layout.svelte        # Root layout (fonts, favicon, skip link)
    decisions/
      new/+page.svelte    # Decision input flow — audience gate + 3 steps + coaching
    demo/                 # Demo routes (Better Auth, Playwright)
      +page.svelte
      better-auth/        # +page.svelte, +page.server.ts
      better-auth/login/
      playwright/
```

Planned (not yet in repo): `lib/ai/prompts.ts`, `routes/api/decisions/generate/+server.ts`. See [docs/APP-STRUCTURE.md](docs/APP-STRUCTURE.md) for a full map.

## Input model

Each decision captures three groups of fields:

**Context** - decision, problem, business area, audience  
**Analysis** - options considered, data & signals, tradeoffs accepted  
**Outcomes** - primary metric, guardrail metric, expected outcome

The coaching model challenges each step before the user proceeds - questions are calibrated to the selected audience.

## API

`POST /api/decisions/generate`

Requires authentication. Rate limited to 10 requests per IP per hour.

Request body: `DecisionInput` (see `src/lib/ai/prompts.ts`)  
Response: `{ prepare: string, communicate: string, portfolio: string }`

## Status

MVP in progress. Authentication required for all users. Public mode (one output per session, no account required) planned for v2.

## What's not built yet

- Outputs page - rendering the three generated modes
- Decision log - saved history per user
- Database schema - Drizzle + Neon, structure TBD
- Public mode - future, one output per session via cookie
- Audience modes beyond CEO - CPO, CFO, Engineering Lead scaffolded, prompts pending

