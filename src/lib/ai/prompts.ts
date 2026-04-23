// src/lib/ai/prompts.ts

export interface DecisionInput {
  audience: string;        // 'ceo' | 'cpo' | 'cfo' | 'eng'
  audienceLabel: string;   // 'CEO' | 'CPO' etc.
  decision: string;
  problem: string;
  businessArea: string;
  options: string;
  data: string;
  tradeoffs: string;
  primaryMetric: string;
  guardrailMetric: string;
  expectedOutcome: string;
}

export interface PromptParts {
  system: string;
  user: string;
}

/** Optional context when generating communicate/portfolio after prepare. */
export interface PromptBuildOptions {
  prepareReview?: string;
}

function buildPrepareReviewBlockCommunicate(text: string): string {
  return `
INTERNAL DESIGNER REVIEW (already produced — for your context only; not the leadership deliverable)
================================================================================
${text}

The designer completed this internal review before this step. Use it to inform your framing: strengthen the recommendation and "What We're Accepting" where gaps or tradeoffs matter; reflect decision readiness in tone and substance where appropriate; ensure the substance anticipates the hardest leadership question without naming this as an internal exercise.

Your output must be a clean executive brief only. Write in appropriate executive language. Do not paste or echo raw internal-review wording. Do not add a section that presents this review. Follow only the structure below.
`.trim();
}

function buildPrepareReviewBlockPortfolio(text: string): string {
  return `
INTERNAL DESIGNER REVIEW (already produced — for your context only)
================================================================================
${text}

The designer completed this internal review before this step. Use it to inform the case study: you may integrate honest reflection on gaps, tradeoffs, confidence, and how they would handle the hardest leadership question, in first person where it reads naturally. The output must still read as a polished portfolio narrative, not a verbatim reuse of the review above.

Follow only the structure below.
`.trim();
}

function line(label: string, value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const t = value.trim();
  if (t === '') return undefined;
  return `${label}: ${t}`;
}

// Shared context block — injected into every prompt
function buildContext(input: DecisionInput): string {
  const rows = [
    'DECISION INPUT',
    '==============',
    line('Decision', input.decision),
    line('Problem', input.problem),
    line('Business Area', input.businessArea),
    line('Options Considered', input.options),
    line('Data & Signals', input.data),
    line('Tradeoffs Accepted', input.tradeoffs),
    line('Primary Metric', input.primaryMetric),
    line('Guardrail Metric', input.guardrailMetric),
    line('Expected Outcome', input.expectedOutcome),
    line('Target Audience', input.audienceLabel),
  ].filter((x): x is string => x !== undefined);
  return rows.join('\n');
}

// ─────────────────────────────────────────
// MODE 0: CONFIDENCE CHECK
// Purpose: fast gate before full prepare review
// Tone: direct, structured
// Length: minimal — two lines only
// ─────────────────────────────────────────
export function buildConfidencePrompt(input: DecisionInput): PromptParts {
  const system = `
You are a senior product strategist doing a quick triage of a design decision before a full review.

Your job is to assess, in one pass, whether this decision is ready to be reviewed in depth. Be ruthlessly honest. Do not inflate confidence to be encouraging.
`.trim();

  const user = `
${buildContext(input)}

Assess the readiness of this decision. Respond with exactly two lines:

Rating: [Not Ready | Needs Work | Ready to Present]
Reason: [one sentence — the single most important reason for your rating]

Criteria:
- Not Ready: fundamental gaps in reasoning or missing key data that would make a full review premature
- Needs Work: reasoning is sound but framing, metric grounding, or business case has gaps
- Ready to Present: decision is well-reasoned and framed for a business audience
`.trim();

  return { system, user };
}

// ─────────────────────────────────────────
// MODE 1: PREPARE DECISION
// Purpose: help the designer think before committing
// Tone: direct, structured, honest — for the designer's eyes only
// Length: medium — structured sections, not prose
// ─────────────────────────────────────────
export function buildPreparePrompt(input: DecisionInput): PromptParts {
  const system = `
You are a senior product strategist helping a designer pressure-test a decision before they commit to it.

Your job is not to validate their thinking — it is to stress-test it. Be direct. Surface gaps. Ask the hard questions they haven't asked themselves. Do not soften criticism. Do not use hedging phrases like "you might want to consider" or "it could be worth exploring" — if there is a fundamental gap, name it plainly.

This output is for the designer only — not for leadership. Write as if you are their most trusted, most demanding colleague.

Work only with what the user has provided. If a field is missing or thin, reflect that gap in your output — do not invent plausible-sounding content to fill it.
`.trim();

  const user = `
${buildContext(input)}

Produce a structured decision review with the following sections. Use plain headers (no markdown decorations beyond ##). Be concise within each section.

## Decision Summary
One sentence restating the decision clearly and neutrally.

## What's Strong
2–3 bullets. Format: [the insight] — [why it matters in one clause]. No full sentences.

## What Needs Work
2–3 bullets. Each uses this exact format:
**[Gap label]**: [one sentence — the gap and why it will matter in front of a business audience]. Fix: [one sentence — what closes it].

## The Question Leadership Will Ask First
The question that, if asked in a leadership meeting, would most undermine confidence in this decision — not a clarifying question, but one that exposes a gap in the reasoning or a risk they haven't named. State it as a direct question. Then give a one-sentence suggestion for how to prepare the answer.

## Decision Confidence
Rate the current state of this decision: Not Ready / Needs Work / Ready to Present. Criteria — Not Ready: fundamental gaps in reasoning or missing key data; Needs Work: reasoning is sound but communication or framing gaps remain; Ready to Present: decision is well-reasoned and framed for a business audience. Give one sentence of justification.

Write in plain English. Do not start any sentence with "I".
`.trim();

  return { system, user };
}

// ─────────────────────────────────────────
// MODE 2: COMMUNICATE TO LEADERSHIP
// Purpose: exec-ready communication for a specific audience
// Tone: business language — no design jargon
// Length: short and dense — leadership reads fast
// ─────────────────────────────────────────
export function buildCommunicatePrompt(input: DecisionInput, options?: PromptBuildOptions): PromptParts {
  const audienceGuidance: Record<string, string> = {
    ceo: `You are writing for a CEO. They care about business impact, risk, and strategic fit. They do not want design rationale or UX detail. Frame everything in terms of revenue, growth, retention, or competitive position. They need to understand the decision, the risk of inaction, and what you are recommending — in under 2 minutes of reading. Never use design or product jargon. Do not use the words "experience", "usability", "friction", or "journey".`,
    cpo: `You are writing for a Chief Product Officer. They care about product strategy, user insight, and how this decision fits the roadmap. They want to understand the tradeoffs clearly, see the metric impact, and know the product rationale. They can handle more depth than a CEO but still expect business framing — no UX jargon, no design process detail. Show how this decision moves a product metric and what it trades off against other roadmap priorities. Do not use the words "usability", "friction", or "journey".`,
    cfo: `You are writing for a CFO. They care about cost of inaction, expected return, and resource justification. Frame everything in terms of financial impact, efficiency, and risk. Be explicit about what this costs (time, people, or money) and what the expected return is. If a number isn't available, name the absence rather than omitting it. Avoid product, design, or UX language entirely — if it can't be expressed in business or financial terms, it doesn't belong in this brief.`,
    eng: `You are writing for an Engineering Lead. They care about technical dependencies, implementation complexity, and risk to existing systems. Be specific about what this decision requires technically, what it changes about current systems, and what risks it introduces for engineering. Do not assume they care about business metrics or user outcomes — lead with technical impact and implementation reality. Flag ambiguities that will require engineering input before the decision can be acted on.`
  };

  const guidance = audienceGuidance[input.audience] ?? audienceGuidance.ceo;

  const system = `
You are a communications specialist helping a designer translate a product decision into language their leadership understands.

${guidance}
`.trim();

  const prepareReview = options?.prepareReview?.trim();
  const reviewSection = prepareReview
    ? `\n\n${buildPrepareReviewBlockCommunicate(prepareReview)}\n\n`
    : '\n\n';

  const user = `
${buildContext(input)}${reviewSection}
Produce an executive communication with the following structure. Keep it tight — this should be readable in under 2 minutes.

Use bullet lists only in **What Was Considered**; in every other section use compact prose (no bullets).

## The Decision
One sentence. What is being decided. No design language.

## Why This Matters Now
2–3 sentences, max 35 words. The business problem and the cost of inaction. Reference the primary metric. Make the urgency clear without being alarmist.

## What Was Considered
3–4 bullet points. The options evaluated, stated neutrally. Only include options the user explicitly named — do not invent alternatives. Include the do-nothing option only if the user mentioned it.

## The Recommendation
1–2 sentences. What you are recommending and why it is the strongest option relative to the alternatives.

## Expected Impact
2–3 sentences, max 35 words. What success looks like. Reference the primary metric and guardrail metric by name. State the expected outcome as a prediction, not a guarantee.

## What We're Accepting
1–2 sentences. The tradeoff, stated plainly. Leadership should never discover a downside you didn't name.

Write in plain business English. No design jargon. No passive voice. Do not start any sentence with "I". Do not use the word "leverage".
`.trim();

  return { system, user };
}

// ─────────────────────────────────────────
// MODE 3: PORTFOLIO CASE
// Purpose: narrative case study for interviews and portfolio
// Tone: reflective, structured, first-person where appropriate
// Length: longer — tells the full story with context and learnings
// ─────────────────────────────────────────
export function buildPortfolioPrompt(input: DecisionInput, options?: PromptBuildOptions): PromptParts {
  const system = `
You are helping a designer write a portfolio case study about a product decision they made.

The output should read like a well-written case study — not a report. It tells a story: the situation, the thinking, the decision, and what was learned. It should demonstrate strategic thinking, business fluency, and design leadership.

Write for an audience of hiring managers, design directors, and CTOs who review portfolios. They are looking for evidence of clear thinking, business impact, and the ability to communicate decisions to non-design stakeholders.

Work only with what the user has provided. If a field is missing or thin, reflect that honestly — do not invent context, metrics, or outcomes to fill gaps.
`.trim();

  const prepareReview = options?.prepareReview?.trim();
  const reviewSection = prepareReview
    ? `\n\n${buildPrepareReviewBlockPortfolio(prepareReview)}\n\n`
    : '\n\n';

  const user = `
${buildContext(input)}${reviewSection}
Produce a portfolio case study with the following structure:

## Overview
2–3 sentences. The context, the challenge, and the outcome. This is the hook — write it to make the reader want to continue.

## The Situation
2–3 sentences. What was happening, why it mattered, and what the stakes were. Include relevant business context. Set the scene without excessive background.

## How I Approached It
2–3 sentences. What options were evaluated and why. How data and signals informed the thinking. What made this decision difficult or non-obvious.

## The Decision
2–3 sentences. What was decided and why this was the strongest path relative to the alternatives. State the tradeoff accepted and why it was acceptable.

## What Success Looks Like
2–3 sentences. The primary metric, the guardrail, and the expected outcome. Frame this as a prediction the designer made and is accountable to.

## What This Demonstrates
3–4 bullet points. The skills and qualities this decision shows. Every bullet must reference something specific from this decision — a tradeoff named, a metric chosen, a stakeholder dynamic navigated. Do not write generic claims that could apply to any designer, such as "demonstrates strategic thinking", "shows ability to work with stakeholders", or "highlights communication skills".

Write in a clear, confident voice. First person is appropriate where it reflects genuine ownership. Do not use buzzwords like "leveraged", "synergy", "holistic", or "stakeholder alignment". Do not start any section with "In conclusion" or "Overall".
`.trim();

  return { system, user };
}
