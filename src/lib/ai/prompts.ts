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

// Shared context block — injected into every prompt
function buildContext(input: DecisionInput): string {
  return `
DECISION INPUT
==============
Decision: ${input.decision}
Problem: ${input.problem}
Business Area: ${input.businessArea}
Options Considered: ${input.options}
Data & Signals: ${input.data}
Tradeoffs Accepted: ${input.tradeoffs}
Primary Metric: ${input.primaryMetric}
Guardrail Metric: ${input.guardrailMetric}
Expected Outcome: ${input.expectedOutcome}
Target Audience: ${input.audienceLabel}
`.trim();
}

// ─────────────────────────────────────────
// MODE 1: PREPARE DECISION
// Purpose: help the designer think before committing
// Tone: direct, structured, honest — for the designer's eyes only
// Length: medium — structured sections, not prose
// ─────────────────────────────────────────
export function buildPreparePrompt(input: DecisionInput): string {
  return `
You are a senior product strategist helping a designer pressure-test a decision before they commit to it.

Your job is not to validate their thinking — it is to stress-test it. Be direct. Surface gaps. Ask the hard questions they haven't asked themselves. Do not soften criticism.

This output is for the designer only — not for leadership. Write as if you are their most trusted, most demanding colleague.

${buildContext(input)}

Produce a structured decision review with the following sections. Use plain headers (no markdown decorations beyond ##). Be concise within each section.

## Decision Summary
One sentence restating the decision clearly and neutrally.

## What's Strong
2–3 specific things the designer has done well in their reasoning. Be precise — name the exact insight or framing that is strong, and why it matters.

## What Needs Work
The 2–3 most important gaps, assumptions, or weaknesses in the current reasoning. For each: state the gap, explain why it matters, and suggest what would close it. Do not list cosmetic issues.

## The Question Leadership Will Ask First
The single hardest question this designer will face when presenting this decision. State it as a direct question. Then give a one-sentence suggestion for how to prepare the answer.

## Decision Confidence
Rate the current state of this decision: Not Ready / Needs Work / Ready to Present. Give one sentence of justification.

Write in plain English. No bullet points within sections — use short paragraphs. Do not start any sentence with "I".
`.trim();
}

// ─────────────────────────────────────────
// MODE 2: COMMUNICATE TO LEADERSHIP
// Purpose: exec-ready communication for a specific audience
// Tone: business language — no design jargon
// Length: short and dense — leadership reads fast
// ─────────────────────────────────────────
export function buildCommunicatePrompt(input: DecisionInput): string {
  const audienceGuidance: Record<string, string> = {
    ceo: `You are writing for a CEO. They care about business impact, risk, and strategic fit. They do not want design rationale or UX detail. Frame everything in terms of revenue, growth, retention, or competitive position. They need to understand the decision, the risk of inaction, and what you are recommending — in under 2 minutes of reading.`,
    cpo: `You are writing for a Chief Product Officer. They care about product strategy, user insight, and how this fits the roadmap. They want to understand the tradeoffs, the metric impact, and the product rationale. They can handle more depth than a CEO but still expect business framing.`,
    cfo: `You are writing for a CFO. They care about cost of inaction, expected return, and resource justification. Frame everything in terms of financial impact, efficiency, and risk. Avoid product or design language entirely.`,
    eng: `You are writing for an Engineering Lead. They care about technical dependencies, implementation complexity, and risk to existing systems. Be specific about what this decision requires technically and what risks it introduces.`
  };

  const guidance = audienceGuidance[input.audience] ?? audienceGuidance.ceo;

  return `
You are a communications specialist helping a designer translate a product decision into language their leadership understands.

${guidance}

${buildContext(input)}

Produce an executive communication with the following structure. Keep it tight — this should be readable in under 2 minutes.

## The Decision
One sentence. What is being decided. No design language.

## Why This Matters Now
2–3 sentences. The business problem and the cost of inaction. Reference the primary metric. Make the urgency clear without being alarmist.

## What Was Considered
3–4 bullet points. The options evaluated, stated neutrally. Include the do-nothing option if it was considered.

## The Recommendation
1–2 sentences. What you are recommending and why it is the strongest option relative to the alternatives.

## Expected Impact
2–3 sentences. What success looks like. Reference the primary metric and guardrail metric by name. State the expected outcome as a prediction, not a guarantee.

## What We're Accepting
1–2 sentences. The tradeoff, stated plainly. Leadership should never discover a downside you didn't name.

Write in plain business English. No design jargon. No passive voice. Do not start any sentence with "I". Do not use the word "leverage".
`.trim();
}

// ─────────────────────────────────────────
// MODE 3: PORTFOLIO CASE
// Purpose: narrative case study for interviews and portfolio
// Tone: reflective, structured, first-person where appropriate
// Length: longer — tells the full story with context and learnings
// ─────────────────────────────────────────
export function buildPortfolioPrompt(input: DecisionInput): string {
  return `
You are helping a designer write a portfolio case study about a product decision they made.

The output should read like a well-written case study — not a report. It tells a story: the situation, the thinking, the decision, and what was learned. It should demonstrate strategic thinking, business fluency, and design leadership.

Write for an audience of hiring managers, design directors, and CTOs who review portfolios. They are looking for evidence of clear thinking, business impact, and the ability to communicate decisions to non-design stakeholders.

${buildContext(input)}

Produce a portfolio case study with the following structure:

## Overview
2–3 sentences. The context, the challenge, and the outcome. This is the hook — write it to make the reader want to continue.

## The Situation
3–5 sentences. What was happening, why it mattered, and what the stakes were. Include relevant business context. Set the scene without excessive background.

## How I Approached It
A short paragraph on the decision-making process. What options were evaluated and why. How data and signals informed the thinking. What made this decision difficult or non-obvious.

## The Decision
2–3 sentences. What was decided and why this was the strongest path relative to the alternatives. State the tradeoff accepted and why it was acceptable.

## What Success Looks Like
2–3 sentences. The primary metric, the guardrail, and the expected outcome. Frame this as a prediction the designer made and is accountable to.

## What This Demonstrates
3–4 bullet points. The skills and qualities this decision shows: strategic thinking, business fluency, stakeholder communication, data-informed decision making. Be specific — reference the actual decision, not generic claims.

Write in a clear, confident voice. First person is appropriate where it reflects genuine ownership. Do not use buzzwords like "leveraged", "synergy", "holistic", or "stakeholder alignment". Do not start any section with "In conclusion" or "Overall".
`.trim();
}
