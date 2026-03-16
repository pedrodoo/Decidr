/**
 * Centralized app strings. Edit this file to review and update all user-facing copy.
 */

export const strings = {
  // ---------------------------------------------------------------------------
  // Common
  // ---------------------------------------------------------------------------
  common: {
    continue: 'Continue',
    back: 'Back',
    change: 'Change',
    soon: 'Soon',
  },

  // ---------------------------------------------------------------------------
  // Audience gate (who are you communicating to?)
  // ---------------------------------------------------------------------------
  audienceGate: {
    title: 'Who are you communicating this decision to?',
    intro:
      "Your answer shapes everything — the questions you'll be asked, the framing of your outputs, and the language that will land. Choose before you start.",
    startWith: 'Start with {label}', // {label} replaced with audience label
    audiences: [
      {
        id: 'ceo',
        label: 'CEO',
        icon: '🎯',
        description:
          'Business impact, risk, and strategic fit. No design jargon. One decision, clearly framed in terms of revenue, growth, or competitive position.',
        available: true,
      },
      {
        id: 'cpo',
        label: 'CPO',
        icon: '📦',
        description:
          'Product rationale, user insight, and metric impact. Deeper on tradeoffs and how this fits the product strategy.',
        available: false,
      },
      {
        id: 'cfo',
        label: 'CFO',
        icon: '📊',
        description:
          'Cost of inaction, expected return, and resource justification. Framed around financial impact and efficiency.',
        available: false,
      },
      {
        id: 'eng',
        label: 'Engineering Lead',
        icon: '⚙️',
        description:
          'Technical dependencies, implementation complexity, and risk to existing systems.',
        available: false,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Audience indicator (pill showing current audience)
  // ---------------------------------------------------------------------------
  audienceIndicator: {
    label: 'Audience',
    changeAudienceAria: 'Change audience',
  },

  // ---------------------------------------------------------------------------
  // Step progress (Context / Analysis / Outcomes)
  // ---------------------------------------------------------------------------
  stepProgress: {
    ariaLabel: 'Decision steps',
    steps: [
      { n: 1, label: 'Context' },
      { n: 2, label: 'Analysis' },
      { n: 3, label: 'Outcomes' },
    ],
  },

  // ---------------------------------------------------------------------------
  // Coach response (feedback card)
  // ---------------------------------------------------------------------------
  coach: {
    regionAria: 'Coaching feedback',
    footerText: 'You can revise above, or continue.',
    defaultContinueLabel: 'Continue',
  },

  // ---------------------------------------------------------------------------
  // New decision page
  // ---------------------------------------------------------------------------
  newDecision: {
    pageTitle: 'New Decision — Decidr',

    fieldLabels: {
      decision: 'Decision',
      problem: 'Problem',
      businessArea: 'Business Area',
      businessAreaPrompt: 'Which area does this decision most directly affect?',
      options: 'Options Considered',
      data: 'Data & Signals',
      tradeoffs: 'Tradeoffs Accepted',
      primaryMetric: 'Primary Metric',
      guardrailMetric: 'Guardrail Metric',
      expectedOutcome: 'Expected Outcome',
      whatYouGet: "What you'll get",
      whatYouGetPrompt: "One input. Three outputs. Each built for a different purpose.",
    },

    placeholders: {
      decision: 'e.g. Remove social login from the signup screen',
      problem: "What's broken or suboptimal? What happens if you don't act?",
      options: 'Option A: ...\nOption B: ...\nOption C: Do nothing',
      data: 'Any numbers, research, or observations — qualitative signals count too.',
      tradeoffs:
        'e.g. Short-term drop in X. We accept this because long-term Y matters more.',
      primaryMetric: 'e.g. Signup completion rate',
      guardrailMetric: 'e.g. Day-7 retention',
      expectedOutcome:
        'e.g. Removing X will recover signup completion from 56% to ~68% within 2 sprints.',
    },

    businessAreas: [
      { id: 'activation', label: 'Activation', class: 'activation' },
      { id: 'conversion', label: 'Conversion', class: 'conversion' },
      { id: 'retention', label: 'Retention', class: 'retention' },
      { id: 'revenue', label: 'Revenue', class: 'revenue' },
    ],

    stepCounter: 'Step {current} of {total}', // {current}, {total}
    generateOutputs: 'Generate outputs',

    outputPreview: {
      oneTitle: 'Prepare Decision',
      oneDesc: 'Structured reasoning to review before you commit. For you, not for them.',
      twoTitle: 'Communicate to Leadership',
      twoDesc: 'Exec-ready language for a {audienceLabel}. Business impact, risk, and clear recommendation.',
      threeTitle: 'Portfolio Case',
      threeDesc: 'A structured case study narrative for interviews and portfolio work.',
    },

    stepLabels: {
      contextReview: 'Context review',
      analysisReview: 'Analysis review',
    },

    // Prompts shown above each field (may include HTML). Keyed by audience id.
    prompts: {
      ceo: {
        decision:
          'A CEO needs to understand this in one sentence — and it needs to sound like a business decision, not a design task. <strong>What are you deciding?</strong>',
        problem:
          'Frame this as a business problem, not a UX observation. <strong>What is the cost of not acting?</strong> A CEO will want to know that before anything else.',
        options:
          "<strong>Include the option to do nothing.</strong> A CEO will ask why you're not running a test first, or why you're not trying a less drastic change. Anticipate that.",
        data:
          'Qualitative signals count — but <strong>name them as signals, not facts.</strong> A CEO will probe anything that looks like assumption dressed as data.',
        tradeoffs:
          "A CEO needs to know what you're giving up — <strong>and that you've thought about whether the business can absorb it.</strong> Don't hide the downside.",
        primaryMetric: 'The number that tells you this decision worked.',
        guardrailMetric: "The metric you're <strong>not willing to sacrifice.</strong>",
        expectedOutcome:
          '<strong>Make a prediction you can be held to.</strong> A CEO will remember what you said. Vague expectations are worse than honest uncertainty.',
      },
      // Add cpo, cfo, eng when those audiences are enabled
    },

    // Coach content per step per audience (intro, questions, challenge, continueLabel)
    coachContent: {
      ceo: {
        1: {
          intro:
            "Good start. The problem statement is concrete and you've named the business impact. Before you move to analysis, consider what a CEO will immediately push back on:",
          questions: [
            "The drop in conversion — is this <em>caused</em> by your recent change, or correlated with when it shipped? A CEO will ask how they know it's this, not something else. Have an answer ready.",
            "Who originally asked for this feature? If it was a leadership call, your recommendation to reverse it needs to acknowledge that directly — or it looks like you're overriding a previous decision without context.",
            "'Users are confused' — is this observed behaviour (recordings, tickets) or a hypothesis? Name your source. A CEO won't accept that without evidence.",
          ],
          challenge:
            "<strong>Think about this:</strong> You're framing this as a conversion problem. A CEO might reframe it as a growth problem — not just fixing what broke, but what does fixing it <em>unlock</em>? What does recovery mean for monthly new users and downstream revenue?",
          challengeIsPositive: false,
          continueLabel: 'Continue to Analysis',
        },
        2: {
          intro:
            "Solid. Options are well-defined, the do-nothing case is included, and the tradeoff is named honestly. Two things a CEO will likely push on:",
          questions: [
            "Why aren't you testing first? If you're shipping directly, say why — speed, confidence in data, cost of delay. A CEO who values data-driven decisions will question a direct ship over a test.",
            "The tradeoff names the user impact but not the business impact. How many signups per week does 'some users who drop off' represent? Even a rough estimate makes this more defensible.",
          ],
          challenge:
            "<strong>Strong point:</strong> Framing this as a quality-of-growth decision — not just a UX fix — is exactly what lands with a CEO. Keep that language when you generate your output.",
          challengeIsPositive: true,
          continueLabel: 'Continue to Outcomes',
        },
      },
    },
  },
};

export default strings;
