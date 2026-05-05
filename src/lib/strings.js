/**
 * Single source of app copy. Edit here to change any user-facing text.
 * Main keys: common, audienceGate, audienceIndicator, stepProgress, coach, newDecision,
 * welcome, decisionsDashboard, decisionOutputs, login, join, landing, topNav, bugReport,
 * layout, demo.
 */

export const strings = {
  // ---------------------------------------------------------------------------
  // Common
  // ---------------------------------------------------------------------------
  common: {
    appName: 'Decidr',
    continue: 'Continue',
    back: 'Back',
    change: 'Change',
    soon: 'Soon',
    generating: 'Generating...',
    unknownError: 'Unknown error',
    somethingWentWrong: 'Something went wrong',
  },

  // ---------------------------------------------------------------------------
  // Audience gate (who are you communicating to?)
  // ---------------------------------------------------------------------------
  audienceGate: {
    title: 'Who are you communicating to?',
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
        label: 'CTO',
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
    startFresh: 'Start fresh decision',
    startFreshAria: 'Discard current decision and start fresh',
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
    pageSrOnlyTitle: 'New Decision',
    validation: {
      emptyGeneric: "Looks empty — without this the output won't have much to work with.",
      optionsOneDetected: "We only detected one option — usually we'd expect to see alternatives here.",
      dataEmpty: 'Looks empty — without evidence, the output may feel thin.',
      tradeoffsEmpty: 'Nothing here — outputs tend to be stronger when tradeoffs are acknowledged.',
      primaryMetricEmpty: 'Looks empty — without a metric, success is hard to define.',
      primaryMetricNoTarget: 'No number or % detected — a metric without a target is hard to evaluate.',
      guardrailEmpty: "Nothing here — consider what you're not willing to sacrifice.",
      expectedOutcomeEmpty: 'Looks empty — without a prediction, the output has less to anchor to.',
      disclaimer:
        'These are rule-based checks, not a full review — you know your context better than we do.',
    },
    coachPlaceholder: {
      badge: 'Coming soon',
      title: 'Input-aware coaching',
      body: `Based on what you've written, this space will surface questions worth sitting with
before you move on — gaps in your reasoning, assumptions to pressure-test, and angles
a {audienceLabel} will likely push back on. Powered by NLP analysis of your specific inputs,
not preset prompts.`,
      sub: "For now, take a moment to re-read what you've written above.",
      continueToAnalysis: 'Continue to Analysis →',
      continueToOutcomes: 'Continue to Outcomes →',
    },

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
          'A CEO needs to understand this in one sentence. It needs to sound like a business decision, not a design task. <strong>What is your iniciative?</strong>',
        problem:
          'Frame this as a business problem, not a UX observation. <strong>What is the cost of not acting?</strong> A CEO will want to know that before anything else.',
        options:
          "<strong>Include the option to do nothing.</strong> A CEO will ask why you're not running a test first, or why you're not trying a less drastic change. Anticipate that. If you only have one option, you haven't explored the space yet.",
        data:
          'Qualitative signals count — but <strong>name them as signals, not facts.</strong> A CEO will probe anything that looks like assumption dressed as data. "Users seem confused" is not data. Name your source: session recordings, support tickets, a survey. Even one number beats a vague impression.',
        tradeoffs:
          "A CEO needs to know what you're giving up — <strong>and that you've thought about whether the business can absorb it.</strong> Don't hide the downside.",
        primaryMetric:
          'Name the metric <strong>and the target.</strong> "Signup rate" is a field name. "Signup completion above 65%" is something you can be held to.',
        guardrailMetric:
          "What breaks if this goes wrong? Even if the primary metric wins, <strong>name the number that would make this decision a failure</strong> regardless.",
        expectedOutcome:
          '<strong>Make a prediction you can be held to.</strong> A CEO will remember what you said. Vague expectations are worse than honest uncertainty. A good prediction has three parts: what changes, by how much, and by when.',
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

  welcome: {
    pageTitle: 'Welcome',
    pageSrOnlyTitle: 'Welcome',
    eyebrow: 'Decidr',
    title: 'For teams who take decision-making seriously.',
    subtitle:
      'Decidr was buikd to help product and design teams turn scattered opinions into clear, shared reasoning so cross-functional decisions move with more trust and less noise.',
    startFirstDecision: 'Start designing for impact',
    startNewDecision: 'Start designing for impact',
    recentTitle: 'Recent narratives',
    viewAll: 'View all',
  },

  decisionsDashboard: {
    pageTitle: 'Story Dashboard',
    eyebrow: 'Decidr',
    title: 'Story Dashboard',
    subtitle: 'All your narratives in one place.',
    newDecisionCta: 'New ',
    emptyTitle: 'No narratives yet',
    emptyBody: 'Once you generate hipothesis, your narratives will appear here.',
    emptyCta: 'Start your first decision',
    iterations: {
      one: 'iteration',
      many: 'iterations',
    },
  },

  decisionOutputs: {
    pageTitle: 'Your narratives',
    backToInputsAria: 'Refine inputs',
    iterationMeta: 'Iteration {current} of {total}',
    generatedAt: 'generated {time}',
    gateLabel: 'Narrative Confidence',
    actions: {
      generateFullReview: 'Generate full review',
      generateFullReviewAnyway: 'Generate full review anyway',
      backToInputs: 'Back to inputs',
      refineInputs: 'Refine inputs →',
    },
    prepare: {
      title: 'Prepare narrative',
      desc: 'For you. Before you commit.',
    },
    communicate: {
      title: 'Communicate to Leadership',
      desc: 'Exec-ready. No design jargon.',
      cardDesc:
        'Translate this narrative into exec-ready language. Framed for a CEO — business impact, risk, and a clear recommendation.',
    },
    portfolio: {
      title: 'Portfolio Case',
      desc: 'Structured narrative for interviews.',
      cardDesc:
        'Turn this story into a structured case study. Built for interviews and portfolio work — with context, reasoning, and what it demonstrates.',
    },
    refineHint: 'Address the gaps above before moving forward.',
    nextLabel: 'What do you need next?',
    persistError: 'Could not persist decision before generating outputs.',
  },

  login: {
    pageTitle: 'Login',
    pageSrOnlyTitle: 'Login',
    eyebrow: 'Decidr',
    title: 'Log in to write your next decision',
    subtitle: 'A quick setup so you can start your first decision flow.',
    labels: {
      email: 'Email',
      password: 'Password',
      name: 'Name',
    },
    placeholders: {
      name: 'For registration',
    },
    actions: {
      login: 'Log in',
      inviteOnly: 'Invite only - request access via survey',
    },
    inviteOnlyTitle: 'Invite only. Request access via the survey on the homepage.',
  },

  join: {
    pageTitle: 'Join Decidr',
    eyebrow: 'Decidr',
    title: "You've been invited",
    subtitle: 'Create your account to start making better decisions.',
    labels: {
      name: 'Name',
      email: 'Email',
      password: 'Password',
    },
    createAccount: 'Create account',
  },

  landing: {
    pageTitle: 'Decidr - Build the business case behind design decisions',
    surveyUrl: 'https://tally.so/r/KYB58A',
    betaBadge: 'Private beta',
    heroTitle: 'Design shapes business.',
    heroAccent: 'Proving it is the hard part.',
    heroSubtitle:
      'Decidr helps product and UX designers build the business case behind their work, so they can start demonstrating their value.',
    earlyAccessPrompt: "If that's you, request early access now.",
    requestEarlyAccess: 'Get early access',
    problem: {
      title: "Design impact is real.<br />Most of it goes unaccounted for.",
      p1: 'Most designers were never taught to make the business case.',
      p2: "When design can't be framed around impact, it gets deprioritised. The product stalls. Talented designers stay tactical when they could be driving strategy.",
      p3: 'Decidr closes that gap. It helps you frame design decisions in language leadership understands — before anyone asks you to justify them.',
      coda: 'Design has always been strategic.<br />Now you can communicate it that way.',
    },
    how: {
      label: 'How it works',
      desc: 'One input. Three outputs.<br />Built for the moments that matter.',
      cards: {
        prepare: {
          title: 'Prepare Case',
          desc: 'Decidr surfaces gaps and flags what leadership is most likely to challenge.',
          tag: 'Before Presenting',
        },
        communicate: {
          title: 'Communicate to Leadership',
          desc: 'Your design case, translated into exec-ready language: business impact, risk, and a clear recommendation for the people who need to say yes.',
          tag: 'In the room',
        },
        portfolio: {
          title: 'Portfolio Case',
          desc: 'The same story, structured as a design leadership case study - context, reasoning, trade-offs, and what it reveals about how you think.',
          tag: 'Beyond the room',
        },
      },
    },
    cta: {
      label: 'Currently in private beta',
      title: 'Design deserves a seat at the table. Decidr helps you claim it.',
      desc: "We're opening access to designers who report to non-design leadership and are ready to turn strong thinking into real business influence.",
    },
  },

  topNav: {
    homeAria: 'Decidr home',
    themeSwitchToLight: 'Switch to light mode',
    themeSwitchToDark: 'Switch to dark mode',
    lightModeTitle: 'Light mode',
    darkModeTitle: 'Dark mode',
    reportBug: 'Report a bug',
    account: 'Account',
    login: 'Log in',
    closeAccountDialog: 'Close account dialog',
    close: 'Close',
    signOut: 'Sign out',
  },

  bugReport: {
    submitFailed: 'Failed to submit bug report.',
    title: 'Report a bug',
    closeDialogAria: 'Close bug report dialog',
    labels: {
      happening: 'What is happening?',
      where: 'Where did it happen?',
      email: 'Your email',
      required: 'required',
    },
    placeholders: {
      description: 'Describe the bug as clearly as possible.',
      where: 'e.g. outputs page after generating response',
    },
    actions: {
      cancel: 'Cancel',
      submitting: 'Sending...',
      submit: 'Submit report',
    },
  },

  layout: {
    skipToMain: 'Skip to main content',
  },

  demo: {
    betterAuth: 'better-auth',
    playwright: 'playwright',
    playwrightTitle: 'Playwright e2e test demo',
    loginTitle: 'Login',
    loginButton: 'Login',
    nameForRegistration: 'Name (for registration)',
    inviteOnlyTitle: 'Invite only. Request access via the survey on the homepage.',
    inviteOnly: 'Invite only - request access via survey',
    signOut: 'Sign out',
  },
};

export default strings;
