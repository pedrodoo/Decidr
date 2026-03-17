# App structure

One-page map of where things live and how the main flow works.

## Routes

| Path | Type | Description |
|------|------|-------------|
| `/` | User-facing | Landing / home page. |
| `/decisions/new` | User-facing | Decision input flow: audience gate → 3 steps → coaching → Generate. Main product screen. |
| `/demo` | Demo | Demo index; links to Playwright and Better Auth demos. |
| `/demo/playwright` | Demo | Playwright demo page. |
| `/demo/better-auth` | Demo | Better Auth demo. |
| `/demo/better-auth/login` | Demo | Better Auth login form demo. |

**Note:** `POST /api/decisions/generate` is described in the README but is **not implemented yet**. Generation will call that API and then navigate to an outputs page (also not built).

## Where things live

- **Pages:** `src/routes/` — file-based routing; each route has `+page.svelte` and optionally `+page.server.ts`.
- **Shared UI:** `src/lib/components/` — AudienceGate, AudienceIndicator, StepProgress, CoachResponse. All used on `/decisions/new`.
- **Copy:** `src/lib/strings.js` — single source of app copy (audience gate, new decision prompts, coach content, common strings).
- **Design:** `src/lib/design-tokens.css` (tokens), `src/app.css` (global base and utilities). See [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).
- **Server:** `src/lib/server/` — auth (Better Auth), db (Drizzle client + schema). Auth schema is in `db/auth.schema.ts` (Better Auth–generated).

Example tests live in `src/lib/vitest-examples/`.

## Flow: `/decisions/new`

1. **Gate** — User picks an audience (e.g. CEO). Copy and coaching tone are keyed by audience; `strings.newDecision` and `strings.audienceGate` drive the UI.
2. **Steps** — Three steps (Context, Analysis, Outcomes). Each step has form fields and an optional inline coach block that appears after the user submits the step.
3. **Generate** — Button calls `handleGenerate()`. Currently logs to console; TODO: POST to API and navigate to outputs page.

State is local to the page (`phase`, `audience`, `currentStep`, `coachVisible`, `form`). No store; form data would be sent to the API on Generate.
