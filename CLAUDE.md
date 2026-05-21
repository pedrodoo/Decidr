# Decidr

Decision-logging tool for designers who report to non-design leadership. One structured input, three AI-generated outputs: **Prepare** (stress-test reasoning), **Communicate** (exec-ready translation), **Portfolio** (case study).

See [README.md](README.md) for product overview, [PLANNING.md](PLANNING.md) for backlog and product decisions, [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) for tokens and styles, [docs/APP-STRUCTURE.md](docs/APP-STRUCTURE.md) for the original flow map (partially outdated — trust the file listing below).

---

## Dev commands

```bash
pnpm dev                           # start dev server at localhost:5173
pnpm build                         # production build
pnpm check                         # svelte-check + TS
pnpm lint                          # prettier + eslint
pnpm format                        # prettier write
pnpm test:unit                     # vitest
pnpm test:e2e                      # playwright

pnpm db:generate && pnpm db:migrate   # run after any schema change
pnpm db:studio                     # drizzle studio
pnpm invite                        # create invite via scripts/invite.ts
pnpm approve-lead user@example.com # approve trial lead + create join invite
pnpm list-people                   # list trial leads, invited users, usage signals
```

Never run `pnpm db:push` — always migrate, never push.

---

## File map

```
src/
  lib/
    ai/prompts.ts          # DecisionPayload type + all three prompt builders
    components/            # AudienceGate, AudienceIndicator, StepProgress,
                           # CoachResponse, TopNav, BugReportModal, BugReportSection, DotMatrix
    decisions/storage.ts   # decision persistence helpers
    server/
      auth.ts              # Better Auth config
      db/index.ts          # Drizzle client
      db/schema.ts         # app schema (decisions, bug_report tables)
      db/auth.schema.ts    # Better Auth–generated, do not edit by hand
      invites.ts           # invite logic
    stores/
      input.ts             # inputStore — persists to localStorage
      outputs.ts           # outputsStore — in-memory only
    strings.js             # single source of all UI copy
    design-tokens.css      # design primitives + semantic tokens
  routes/
    +page.svelte           # landing page (invite-only)
    login/                 # login page
    join/[token]/          # invite acceptance
    welcome/               # post-login welcome
    decisions/
      +page.svelte         # decisions dashboard / log
      new/+page.svelte     # input flow: audience gate → 3 steps → coaching → generate
      outputs/+page.svelte # renders the three generated outputs
    api/
      decisions/generate/+server.ts   # Anthropic API endpoint (POST)
      bugs/+server.ts                 # bug report submission
    demo/                  # demo routes, not production
```

---

## Rules

### Package manager
Always use `pnpm`. Never `npm` or `yarn`.

### Database
Always `pnpm db:generate && pnpm db:migrate` after schema changes. Never `db:push`.

### Svelte
Use Svelte 5 syntax: `$state`, `$derived`, `$props`, `$effect`. Never Svelte 4 store syntax.  
Use `onclick` not `on:click`. Use `onsubmit` not `on:submit`.

### TypeScript
Always TypeScript. Never plain JS for logic. Prefer `type` over `interface` unless extending.

### Environment variables
Use `$env/static/private` for secrets, `$env/static/public` for public vars. Never `process.env`.

### File structure
- Components → `src/lib/components/`
- Stores → `src/lib/stores/`
- AI prompts → `src/lib/ai/`
- Shared types → `src/lib/types/`
- All UI copy → `src/lib/strings.js` (single source of truth — don't hardcode strings in components)

### Stores
Never use `localStorage` directly in components — use the store wrappers.  
`inputStore` persists to localStorage. `outputsStore` is in-memory only.

### AI / Anthropic
Never generate all three outputs simultaneously. `prepare` generates first; the user then chooses `communicate` or `portfolio` separately.  
Always use `$env/static/private` for `ANTHROPIC_API_KEY`.  
Max tokens: Prepare 600 / Communicate 550 / Portfolio 800.

### Auth
All routes except `/`, `/login`, `/join/[token]` require authentication.  
Session available via `locals.user` in server routes. Never expose user data in client-side stores.

### Rate limiting
All API routes calling Anthropic must check IP rate limiting first. Limit: 5 requests/IP/hour. Currently in-memory — Redis is a future upgrade. Trial leads are also capped at 2 lifetime generations (`confidence` + `prepare` only).

### Styling
Use CSS variables from `src/app.css` and `src/lib/design-tokens.css`. Never hardcode colours.  
Dark theme only. Background: `--bg: #111111`.  
Fonts: `--font-sans` for body, `--font-mono` for labels/metadata/code.  
Minimum contrast 4.5:1 (WCAG AA).

### Components
Always include `aria-label` on icon-only buttons. Use semantic HTML — `<button>` for actions, `<a>` for navigation. Never `<div>` for interactive elements.

### Decisions flow
Input flow lives at `/decisions/new`. Outputs at `/decisions/outputs`.  
Never navigate to `/decisions/outputs` without first setting `outputsStore` with at least `prepare`.

---

## Current state (May 2026)

**Built:**
- Auth: invite-only, no self-registration. Join flow via `/join/[token]`.
- Input flow: audience gate → 3-step form (Context, Analysis, Outcomes) with inline AI coaching.
- All three AI output modes working end-to-end (`prepare` / `communicate` / `portfolio`).
- Outputs page renders all three modes with output cards.
- Decisions dashboard at `/decisions` (basic).
- Bug report modal.
- TopNav with login/logout.
- Landing page at `/`.

**Not built yet:**
- Decision persistence to DB (outputs live in `outputsStore`, session-only).
- Public mode (one output per session, no account).
- Audience modes beyond CEO — CPO, CFO, Engineering Lead are scaffolded in the UI and prompt architecture but content/prompts are not wired.
- Re-generate output with adjustments.
- Decision log with saved history per user.
