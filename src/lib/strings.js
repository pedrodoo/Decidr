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
    generatingLabel: 'Generating',
    generatingMessages: [
      'Analyzing your decision...',
      'Building the case for {audienceLabel}...',
      'Preparing your outputs...',
    ],
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
    startFresh: 'Start fresh case',
    startFreshAria: 'Discard current case and start fresh',
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
      businessAreaPrompt: 'Which area does this case most directly affect?',
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
    intentGate: {
      title: 'What are you trying to achieve?',
      subtitle: 'Optional. This helps tailor the questions to your situation.',
      skip: 'Skip for now',
      intents: [
        { id: 'prove-impact', label: 'Prove impact' },
        { id: 'choose-direction', label: 'Choose direction' },
        { id: 'fix-underperformance', label: 'Fix underperformance' },
      ],
    },

    stepCounter: 'Step {current} of {total}', // {current}, {total}
    generateOutputs: 'Generate outputs',
    pageSrOnlyTitle: 'New Decision',
    financialDisclaimer:
      'This recommendation is framed for a CEO audience. Financial robustness is limited until CFO mode is available (budget structure, ROI model, and sensitivity analysis).',
    validation: {
      emptyGeneric: "Looks empty — without this the output won't have much to work with.",
      optionsOneDetected: "Consider including at least two alternatives — even 'do nothing' counts as an option.",
      dataEmpty: "No hard data? That's fine — name the signals that led you here. Qualitative observations count.",
      tradeoffsEmpty: "Worth noting what you're giving up, even roughly.",
      primaryMetricEmpty: "What would tell you this worked? Even a rough indicator helps.",
      primaryMetricNoTarget: "A number or target makes this easier to evaluate — but you can continue without one.",
      guardrailEmpty: "Consider what you wouldn't want to sacrifice, even if it's not measurable yet.",
      expectedOutcomeEmpty: "What do you expect to change? Even a directional prediction helps.",
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
      outcomesReview: 'Outcomes review',
    },

    // Prompts shown above each field (may include HTML). Keyed by audience id or audience:intent.
    prompts: {
      ceo: {
        decision:
          'A CEO needs to understand this in one sentence. It needs to sound like a business decision, not a design task. <strong>What is your initiative?</strong>',
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
      'ceo:prove-impact': {
        decision:
          'State the decision this benchmark will unlock. Keep it specific and business-facing. <strong>What decision will become possible after this measurement?</strong>',
        problem:
          'Frame the uncertainty in business terms. <strong>What risk are you carrying today because impact is not measured?</strong>',
        options:
          'List realistic paths: benchmark now, launch without benchmark, or delay. <strong>Include the do-nothing option.</strong>',
        data:
          'Name your current baseline and signal quality. If data is weak, say so explicitly. <strong>What do you know today, and how reliable is it?</strong>',
        tradeoffs:
          "Be explicit about cost, time, and opportunity cost. <strong>What are you willing to spend to reduce uncertainty?</strong>",
        primaryMetric:
          'Name the metric this benchmark is meant to clarify, with a numeric target if possible.',
        guardrailMetric:
          'Name the metric that must not worsen while testing.',
        expectedOutcome:
          'Write a testable prediction with timeframe. <strong>What result would justify moving forward?</strong>',
      },
      'ceo:choose-direction': {
        decision:
          'Write the decision in one sentence. <strong>What exactly needs to be decided now?</strong>',
        problem:
          'Describe the business downside of delay. <strong>What happens if no decision is made this cycle?</strong>',
        options:
          "List 2-3 realistic alternatives plus do-nothing. <strong>A CEO will ask why this option over the others.</strong>",
        data:
          'Use evidence that differentiates options: impact potential, risk, speed, and confidence.',
        tradeoffs:
          'State what you give up with the recommended option. <strong>No hidden downside.</strong>',
        primaryMetric:
          'Name the metric this decision is expected to improve, with a target.',
        guardrailMetric:
          'Name the metric you refuse to sacrifice while pursuing the primary gain.',
        expectedOutcome:
          'Make a measurable prediction: what changes, by how much, and by when.',
      },
      'ceo:fix-underperformance': {
        decision:
          'State the recovery decision clearly. <strong>What are you changing to recover performance?</strong>',
        problem:
          'Quantify the underperformance and business cost. <strong>How far are you from target, and what does that cost?</strong>',
        options:
          'List recovery options, including low-risk and fast options, plus do-nothing.',
        data:
          'Show trend direction, timing, and the strongest signals for likely causes.',
        tradeoffs:
          'Name side effects of the recovery plan. <strong>What might worsen while you recover the main KPI?</strong>',
        primaryMetric:
          'Name the KPI to recover and the minimum acceptable target.',
        guardrailMetric:
          'Name the KPI that cannot degrade during recovery.',
        expectedOutcome:
          'Set a recovery prediction with timeframe and threshold for success.',
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
    trialEmailLabel: 'Signed in as',
    tourTitle: 'See what Decidr does — in about 5 minutes',
    tourSubtitle:
      'We’ll walk you through a guided tour so you can see how Decidr turns design decisions into business-ready outputs.',
    tourBody:
      'We’ve pre-populated every input field with a realistic example. You don’t need to type anything — just follow the steps.',
    tourBugHint:
      'We’re in private beta — if anything breaks or confuses you, use Report a bug in the top bar.',
    startGuidedTour: 'Start guided tour',
    skipTour: 'Skip tour',
    skipTourHint: 'You can explore with your own decision, but the tour is the fastest way to understand Decidr.',
    returningTitle: 'Ready for your own decision?',
    returningSubtitle:
      'You’ve seen the example. Now try Decidr with a real decision — trial includes 2 AI generations.',
    startOwnDecision: 'Start with your own decision',
    replayTour: 'Replay guided tour',
    startFirstDecision: 'Start designing for impact',
    startNewDecision: 'Start designing for impact',
    recentTitle: 'Recent narratives',
    viewAll: 'View all',
  },

  onboarding: {
    pageTitle: 'Guided tour',
    pageSrOnlyTitle: 'Guided tour',
    eyebrow: 'Guided tour',
    entryTitle: 'A full walkthrough with a realistic example',
    entrySubtitle:
      'You’ll move through the same three steps you’d use for a real decision, then see the outputs Decidr produces.',
    entryBody:
      'All fields are pre-filled with an example case aimed at a CEO audience. Read the coaching notes after each step to see how Decidr responds to what you write.',
    entrySteps: [
      'Context — the decision and the problem',
      'Analysis — options, data, and tradeoffs',
      'Outcomes — metrics and expected results',
      'Outputs — Prepare, Communicate, and Portfolio (example)'
    ],
    beginWalkthrough: 'Begin walkthrough',
    backToWelcome: 'Back to welcome',
    backToEntry: 'Back to tour intro',
    exampleBadge: 'Example',
    walkthroughPageTitle: 'Guided tour — walkthrough',
    walkthroughSrOnly: 'Guided tour walkthrough',
    walkthroughAudienceNote:
      'This example is framed for a CEO audience. Fields are read-only — follow the coaching notes after each step.',
    walkthroughSeeCoaching: 'See coaching feedback',
    walkthroughGenerateOutputs: 'Preview example outputs',
    walkthroughGeneratingNote: 'Loading the example outputs Decidr would produce for this case…',
  },

  demoOutputs: {
    bannerTitle: 'Example outputs',
    bannerBody:
      'These were generated from the guided tour example — not from your own decision. Explore how Prepare, Communicate, and Portfolio read for a CEO audience.',
    startOwnDecision: 'Start with your own decision',
    backToTour: 'Back to tour intro',
    exampleBadge: 'Example',
    tallyFeedback: 'Help us improve Decidr — 2 min feedback',
    bugHint: 'Spotted a bug? Use Report a bug in the top bar.',
    fullAccessNote: 'Example preview · full access unlocks live generation',
    previewDivider: 'Leadership brief and portfolio case (example content below)',
  },

  decisionsDashboard: {
    pageTitle: 'Story Dashboard',
    eyebrow: 'Decidr',
    title: 'Dashboard',
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
      inviteOnly: 'Invite only — enter your email on the homepage',
    },
    inviteOnlyTitle: 'Invite only. Enter your email on the homepage to start a trial.',
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
    emailPlaceholder: 'you@company.com',
    emailLabel: 'Email',
    submitEmail: 'Continue',
    submittingEmail: 'Continuing…',
    emailSuccess: "You're in — taking you to Decidr…",
    emailErrorGeneric: 'Something went wrong. Please try again.',
    emailErrorInvalid: 'Enter a valid email address.',
    privacyNote: 'We use your email for beta access only. No spam.',
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
    coachMarkTitle: 'Private beta',
    coachMarkBody:
      'Help us improve. Tap Report a bug in the top bar if something breaks or feels confusing.',
    coachMarkDismiss: 'Got it',
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
    signOut: 'Sign out',
  },
};

export default strings;
