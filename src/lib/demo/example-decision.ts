import type { AudienceSelection, DecisionForm, IterationOutputs } from '$lib/decisions/storage';

export const DEMO_DECISION_ID = 'demo-onboarding-example';

export type DemoCoachStep = {
	intro: string;
	questions: string[];
	challenge: string;
	challengeIsPositive: boolean;
	continueLabel: string;
};

export const DEMO_AUDIENCE: AudienceSelection = {
	id: 'ceo',
	label: 'CEO',
	icon: '🎯',
	description:
		'Business impact, risk, and strategic fit. No design jargon. One decision, clearly framed in terms of revenue, growth, or competitive position.',
	available: true
};

/** Aligned with strings.newDecision.coachContent.ceo steps 1–2 + custom step 3. */
export const DEMO_FORM: DecisionForm = {
	intent: 'fix-underperformance',
	decision: 'Remove social login from the signup screen',
	problem:
		'Signup completion dropped from 68% to 56% within three weeks of shipping one-click social login. If we do not act, we risk locking in a lower-quality acquisition mix before Q3 planning.',
	businessArea: 'conversion',
	options: `Option A: Remove social login and restore email-only signup
Option B: Keep social login but deprioritise it visually
Option C: Run an A/B test before full removal
Option D: Do nothing — accept lower completion`,
	data: `Session recordings (n=24): users hesitate at the provider picker, then abandon
Support tickets: 18% increase in "can't log in" / duplicate-account issues week-over-week
Funnel data: largest drop between "Choose sign-up method" and "Create password"`,
	tradeoffs:
		'Short-term: some users who only sign up via Google will drop off. We accept this because email signups show higher activation in cohort analysis. Engineering cost: roughly one sprint to remove and clean up auth edge cases.',
	primaryMetric: 'Signup completion rate (target: recover from 56% to 68%)',
	guardrailMetric: 'Day-7 retention (must not fall below 42%)',
	expectedOutcome:
		'Removing social login will recover signup completion from 56% to ~68% within two sprints, without degrading week-one retention.'
};

export const DEMO_COACHING: Record<1 | 2 | 3, DemoCoachStep> = {
	1: {
		intro:
			"Good start. The problem statement is concrete and you've named the business impact. Before you move to analysis, consider what a CEO will immediately push back on:",
		questions: [
			"The drop in conversion — is this <em>caused</em> by your recent change, or correlated with when it shipped? A CEO will ask how they know it's this, not something else. Have an answer ready.",
			"Who originally asked for this feature? If it was a leadership call, your recommendation to reverse it needs to acknowledge that directly — or it looks like you're overriding a previous decision without context.",
			"'Users hesitate at the provider picker' — is this observed behaviour (recordings, tickets) or a hypothesis? Name your source. A CEO won't accept that without evidence."
		],
		challenge:
			"<strong>Think about this:</strong> You're framing this as a conversion problem. A CEO might reframe it as a growth problem — not just fixing what broke, but what does fixing it <em>unlock</em>? What does recovery mean for monthly new users and downstream revenue?",
		challengeIsPositive: false,
		continueLabel: 'Continue to Analysis'
	},
	2: {
		intro:
			'Solid. Options are well-defined, the do-nothing case is included, and the tradeoff is named honestly. Two things a CEO will likely push on:',
		questions: [
			"Why aren't you testing first? If you're shipping directly, say why — speed, confidence in data, cost of delay. A CEO who values data-driven decisions will question a direct ship over a test.",
			"The tradeoff names the user impact but not the business impact. How many signups per week does the Google-only cohort represent? Even a rough estimate makes this more defensible."
		],
		challenge:
			'<strong>Strong point:</strong> Framing this as a quality-of-growth decision — not just a UX fix — is exactly what lands with a CEO. Keep that language when you generate your output.',
		challengeIsPositive: true,
		continueLabel: 'Continue to Outcomes'
	},
	3: {
		intro:
			'Your metrics are specific — signup completion with a numeric target and a guardrail on retention. A CEO will still pressure-test two things:',
		questions: [
			"What baseline window defines the 56% — last 30 days, last quarter, or post-launch only? Without that, 'recover to 68%' is harder to evaluate in a leadership meeting.",
			"Day-7 retention at 42% is a clear floor. Be ready to explain how you'd monitor it weekly and what you'd do if it trends down while completion recovers."
		],
		challenge:
			'<strong>One more lift:</strong> If you can tie the 12-point completion gap to an estimated monthly signup volume, the case moves from design metrics to growth impact — that is what gets resourced.',
		challengeIsPositive: false,
		continueLabel: 'Continue to output preview'
	}
};

export const DEMO_OUTPUTS: IterationOutputs = {
	confidence: `Rating: Needs Work
Reason: The reasoning is directionally sound and the business problem is clear, but metric baselines and the counterfactual for "do nothing" need one more pass before this is ready to present. Closing the gap on weekly signup volume and test-vs-ship rationale would move this to Ready to Present.`,
	prepare: `## Decision
Remove one-click social login from signup and restore email-first registration.

## What Looks Strong
- Clear link between product change and measurable conversion drop
- Options include do-nothing and test paths — not a false binary
- Guardrail metric shows awareness that completion alone is not enough

## Gaps to Close Before Presenting
- Causation vs correlation: prepare a one-slide view tying the drop timeline to the release
- Quantify Google-only signups at risk if you remove the feature
- State explicitly why A/B test is or is not viable in the next two sprints

## The Question Leadership Will Ask First
**"What do we lose in new activated users per month if we wait one more quarter?"**
Prepare a range estimate, even if rough, and name the cost of delay.`,
	communicate: `## Recommendation
Remove social login from the signup flow and restore email-first registration in the next release cycle.

## Business Problem
Signup completion fell from 68% to 56% within three weeks of launching social login. We are carrying unnecessary acquisition friction into Q3 planning if we leave this unchanged.

## Expected Impact
- Primary: Recover signup completion toward 68% within two sprints
- Guardrail: Hold day-7 retention at or above 42%

## What We're Accepting
Some Google-only signups will not convert through email. We accept this tradeoff because email cohorts show stronger activation and fewer support issues.

## What We Need From You
Approval to prioritise removal over further visual tweaks, and alignment that we will not run a multi-sprint A/B test before acting.`,
	portfolio: `## Context
Our team shipped one-click social login to reduce signup friction. Within three weeks, completion fell sharply and support noise increased.

## The Decision
We recommended removing social login and returning to email-first signup, with a clear guardrail on week-one retention.

## Reasoning
Qualitative and funnel data pointed to hesitation at the provider step, not reluctance to sign up overall. The do-nothing path preserved a broken status quo; a limited visual tweak did not address the drop.

## Tradeoffs
We accepted losing a subset of social-only users in exchange for higher-quality completions and lower support load.

## Outcome (projected)
Target recovery from 56% to ~68% completion in two sprints while monitoring retention weekly.

## What This Demonstrates
Judgment under metric pressure, willingness to reverse a shipped feature when data contradicts the original hypothesis, and framing design work in business terms.`
};
