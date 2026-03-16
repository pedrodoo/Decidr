# Planning

## Current focus

Building and validating the AI prompt architecture — confirming that the three output modes produce genuinely distinct results from the same input.

## Next up

- Outputs page — render the three generated modes with clear visual hierarchy
- Connect `handleGenerate` in `+page.svelte` to the `/api/decisions/generate` endpoint
- Database schema — decisions table with Drizzle + Neon
- Decision log — saved history per authenticated user (date + title + business area)
- Better Auth setup — session handling and protected routes

## Decisions made

### Product

**ICP broadened from growth design managers to any designer who reports to non-design leadership.**  
The pain is the same regardless of specialism — good decisions that fail for lack of business language translation.

**One input, three outputs — in a deliberate sequence.**  
Prepare → Communicate → Portfolio. Not parallel choices. The sequence reflects how decisions actually move: think first, communicate second, document third.

**Audience selection before the form.**  
The audience shapes the coaching prompts and the output language. Choosing it first gives the user the right mental frame before they start writing.

**Coaching model instead of a static form.**  
Each step surfaces AI feedback calibrated to the selected audience before the user proceeds. Questions are specific, not generic. Challenges name what will be asked in the room.

**CEO as default audience for MVP.**  
Most generalisable register — if it works for a CEO, it works for any leadership. CPO, CFO, Engineering Lead scaffolded in UI and prompt architecture, content pending.

**Status lifecycle (pending / decided / revisited) cut from MVP.**  
It's overhead without proven core value. The log exists because decisions were saved, not because they were tracked. Second phase.

**Public mode cut from MVP.**  
Auth required for all users. The constraint is intentional — measures real interest. Public mode (one output per session via cookie, no account required) is planned for v2.

**Rate limiting by IP.**  
10 requests per IP per hour. In-memory for MVP. Replace with Redis when scaling.

### Technical

**Three separate Anthropic API calls in parallel via `Promise.all`.**  
Easier to prompt, easier to iterate. Each mode is independent — changing one prompt doesn't affect the others. Cost is manageable at ~$0.03 per submission.

**Max tokens per mode: Prepare 600 / Communicate 400 / Portfolio 800.**  
Keeps outputs focused and costs predictable.

**Coaching history not passed to output prompts.**  
The coaching exists to improve the input. If it worked, the improvement is already in what the user wrote. Passing the coaching dialogue adds tokens and complexity without proportional value. Future feature.

**SvelteKit + Neon + Drizzle + Better Auth + Anthropic API.**  
Neon preferred over Supabase for cleaner workflow. Drizzle preferred over raw SQL.

**pnpm as package manager.**

## Backlog

- Audience modes: CPO, CFO, Engineering Lead — prompts and coaching content
- Re-generate output with adjustments without losing the original
- Tagging by business area visible in the decision log
- Email output directly from the app
- Public mode — one output per session via cookie
- Coaching history as context for output generation
- Leadership → Designer direction — translate OKRs and KPIs into design opportunities

## Out of scope (for now)

- **Experimentation tracker** — a separate product
- **Team collaboration / shared workspaces** — not until single-user flow is solid
- **Version history** — valuable, adds complexity before core value is proven
- **Re-generation with full version history** — second phase
