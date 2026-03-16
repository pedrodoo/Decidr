<script>
  import AudienceGate from '$lib/components/AudienceGate.svelte';
  import AudienceIndicator from '$lib/components/AudienceIndicator.svelte';
  import StepProgress from '$lib/components/StepProgress.svelte';
  import CoachResponse from '$lib/components/CoachResponse.svelte';

  // --- State ---
  let phase = 'gate'; // 'gate' | 'steps'
  let audience = { id: 'ceo', label: 'CEO' };
  let currentStep = 1;

  // Coach visibility per step
  let coachVisible = { 1: false, 2: false, 3: false };

  // Form values
  let form = {
    decision: '',
    problem: '',
    businessArea: '',
    options: '',
    data: '',
    tradeoffs: '',
    primaryMetric: '',
    guardrailMetric: '',
    expectedOutcome: ''
  };

  const businessAreas = [
    { id: 'activation', label: 'Activation', class: 'activation' },
    { id: 'conversion', label: 'Conversion', class: 'conversion' },
    { id: 'retention', label: 'Retention', class: 'retention' },
    { id: 'revenue',   label: 'Revenue',    class: 'revenue' }
  ];

  // --- Audience prompts (calibrated per audience) ---
  // Extend this object when CPO / CFO / Eng are added
  const prompts = {
    ceo: {
      decision: "A CEO needs to understand this in one sentence — and it needs to sound like a business decision, not a design task. <strong>What are you deciding?</strong>",
      problem: "Frame this as a business problem, not a UX observation. <strong>What is the cost of not acting?</strong> A CEO will want to know that before anything else.",
      options: "<strong>Include the option to do nothing.</strong> A CEO will ask why you're not running a test first, or why you're not trying a less drastic change. Anticipate that.",
      data: "Qualitative signals count — but <strong>name them as signals, not facts.</strong> A CEO will probe anything that looks like assumption dressed as data.",
      tradeoffs: "A CEO needs to know what you're giving up — <strong>and that you've thought about whether the business can absorb it.</strong> Don't hide the downside.",
      primaryMetric: "The number that tells you this decision worked.",
      guardrailMetric: "The metric you're <strong>not willing to sacrifice.</strong>",
      expectedOutcome: "<strong>Make a prediction you can be held to.</strong> A CEO will remember what you said. Vague expectations are worse than honest uncertainty."
    }
  };

  // --- Coach content per step (per audience) ---
  const coachContent = {
    ceo: {
      1: {
        intro: "Good start. The problem statement is concrete and you've named the business impact. Before you move to analysis, consider what a CEO will immediately push back on:",
        questions: [
          "The drop in conversion — is this <em>caused</em> by your recent change, or correlated with when it shipped? A CEO will ask "how do you know it's this, not something else?" Have an answer ready.",
          "Who originally asked for this feature? If it was a leadership call, your recommendation to reverse it needs to acknowledge that directly — or it looks like you're overriding a previous decision without context.",
          ""Users are confused" — is this observed behaviour (recordings, tickets) or a hypothesis? Name your source. A CEO won't accept 'users feel confused' without evidence."
        ],
        challenge: "<strong>Think about this:</strong> You're framing this as a conversion problem. A CEO might reframe it as a growth problem — not just fixing what broke, but what does fixing it <em>unlock</em>? What does recovery mean for monthly new users and downstream revenue?",
        challengeIsPositive: false,
        continueLabel: 'Continue to Analysis'
      },
      2: {
        intro: "Solid. Options are well-defined, the do-nothing case is included, and the tradeoff is named honestly. Two things a CEO will likely push on:",
        questions: [
          "Why aren't you testing first? If you're shipping directly, say why — speed, confidence in data, cost of delay. A CEO who values data-driven decisions will question a direct ship over a test.",
          "The tradeoff names the user impact but not the business impact. How many signups per week does 'some users who drop off' represent? Even a rough estimate makes this more defensible."
        ],
        challenge: "<strong>Strong point:</strong> Framing this as a quality-of-growth decision — not just a UX fix — is exactly what lands with a CEO. Keep that language when you generate your output.",
        challengeIsPositive: true,
        continueLabel: 'Continue to Outcomes'
      }
    }
  };

  // --- Handlers ---
  function handleAudienceStart(selected) {
    audience = selected;
    phase = 'steps';
  }

  function handleAudienceReset() {
    phase = 'gate';
    currentStep = 1;
    coachVisible = { 1: false, 2: false, 3: false };
  }

  function submitStep(n) {
    coachVisible[n] = true;
    // Scroll to coach after tick
    setTimeout(() => {
      document.getElementById(`coach-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }

  function goToStep(n) {
    currentStep = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setArea(id) {
    form.businessArea = id;
  }

  function handleGenerate() {
    // TODO: POST form data to API route, navigate to outputs page
    console.log('Generate outputs', { audience, form });
  }

  // Convenience: get current audience's prompts
  $: p = prompts[audience.id] ?? prompts.ceo;
  $: c = coachContent[audience.id] ?? coachContent.ceo;
</script>

<svelte:head>
  <title>New Decision — Decidr</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="page">

  <!-- AUDIENCE GATE -->
  {#if phase === 'gate'}
    <AudienceGate onStart={handleAudienceStart} />
  {/if}

  <!-- STEPS -->
  {#if phase === 'steps'}
    <AudienceIndicator label={audience.label} onReset={handleAudienceReset} />
    <StepProgress {currentStep} />

    <!-- STEP 1: CONTEXT -->
    {#if currentStep === 1}
      <div class="step">
        <div class="field">
          <label class="field-label" for="f-decision">Decision</label>
          <p class="field-prompt">{@html p.decision}</p>
          <input id="f-decision" type="text" bind:value={form.decision} placeholder="e.g. Remove social login from the signup screen" />
        </div>

        <div class="field">
          <label class="field-label" for="f-problem">Problem</label>
          <p class="field-prompt">{@html p.problem}</p>
          <textarea id="f-problem" class="short" bind:value={form.problem} placeholder="What's broken or suboptimal? What happens if you don't act?"></textarea>
        </div>

        <div class="field">
          <div class="field-label">Business Area</div>
          <p class="field-prompt">Which area does this decision most directly affect?</p>
          <div class="pill-group">
            {#each businessAreas as area}
              <button
                type="button"
                class="pill {area.class}"
                class:active={form.businessArea === area.id}
                on:click={() => setArea(area.id)}
              >
                {area.label}
              </button>
            {/each}
          </div>
        </div>

        <div class="step-actions">
          <span class="step-counter">Step 1 of 3</span>
          <button class="btn-primary" type="button" on:click={() => submitStep(1)}>
            Continue
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div id="coach-1">
          <CoachResponse
            visible={coachVisible[1]}
            stepLabel="Context review"
            audienceLabel={audience.label}
            intro={c[1].intro}
            questions={c[1].questions}
            challenge={c[1].challenge}
            challengeIsPositive={c[1].challengeIsPositive}
            continueLabel={c[1].continueLabel}
            onContinue={() => goToStep(2)}
          />
        </div>
      </div>
    {/if}

    <!-- STEP 2: ANALYSIS -->
    {#if currentStep === 2}
      <div class="step">
        <div class="field">
          <label class="field-label" for="f-options">Options Considered</label>
          <p class="field-prompt">{@html p.options}</p>
          <textarea id="f-options" class="medium" bind:value={form.options} placeholder="Option A: ...&#10;Option B: ...&#10;Option C: Do nothing"></textarea>
        </div>

        <div class="field">
          <label class="field-label" for="f-data">Data & Signals</label>
          <p class="field-prompt">{@html p.data}</p>
          <textarea id="f-data" class="short" bind:value={form.data} placeholder="Any numbers, research, or observations — qualitative signals count too."></textarea>
        </div>

        <div class="field">
          <label class="field-label" for="f-tradeoffs">Tradeoffs Accepted</label>
          <p class="field-prompt">{@html p.tradeoffs}</p>
          <textarea id="f-tradeoffs" class="short" bind:value={form.tradeoffs} placeholder="e.g. Short-term drop in X. We accept this because long-term Y matters more."></textarea>
        </div>

        <div class="step-actions">
          <button class="btn-secondary" type="button" on:click={() => goToStep(1)}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M9 3L5 7l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back
          </button>
          <div class="actions-right">
            <span class="step-counter">Step 2 of 3</span>
            <button class="btn-primary" type="button" on:click={() => submitStep(2)}>
              Continue
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M5 3l4 4-4 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div id="coach-2">
          <CoachResponse
            visible={coachVisible[2]}
            stepLabel="Analysis review"
            audienceLabel={audience.label}
            intro={c[2].intro}
            questions={c[2].questions}
            challenge={c[2].challenge}
            challengeIsPositive={c[2].challengeIsPositive}
            continueLabel={c[2].continueLabel}
            onContinue={() => goToStep(3)}
          />
        </div>
      </div>
    {/if}

    <!-- STEP 3: OUTCOMES -->
    {#if currentStep === 3}
      <div class="step">
        <div class="field-row">
          <div class="field">
            <label class="field-label" for="f-metric">Primary Metric</label>
            <p class="field-prompt">{@html p.primaryMetric}</p>
            <input id="f-metric" type="text" bind:value={form.primaryMetric} placeholder="e.g. Signup completion rate" />
          </div>
          <div class="field">
            <label class="field-label" for="f-guardrail">Guardrail Metric</label>
            <p class="field-prompt">{@html p.guardrailMetric}</p>
            <input id="f-guardrail" type="text" bind:value={form.guardrailMetric} placeholder="e.g. Day-7 retention" />
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="f-outcome">Expected Outcome</label>
          <p class="field-prompt">{@html p.expectedOutcome}</p>
          <input id="f-outcome" type="text" bind:value={form.expectedOutcome} placeholder="e.g. Removing X will recover signup completion from 56% to ~68% within 2 sprints." />
        </div>

        <div class="divider"></div>

        <div class="field">
          <div class="field-label">What you'll get</div>
          <p class="field-prompt">One input. Three outputs. Each built for a different purpose.</p>
          <div class="output-preview">
            <div class="output-mode">
              <span class="output-num one">1</span>
              <div>
                <div class="output-title">Prepare Decision</div>
                <div class="output-desc">Structured reasoning to review before you commit. For you, not for them.</div>
              </div>
            </div>
            <div class="output-mode">
              <span class="output-num two">2</span>
              <div>
                <div class="output-title">Communicate to Leadership</div>
                <div class="output-desc">Exec-ready language for a {audience.label}. Business impact, risk, and clear recommendation.</div>
              </div>
            </div>
            <div class="output-mode">
              <span class="output-num three">3</span>
              <div>
                <div class="output-title">Portfolio Case</div>
                <div class="output-desc">A structured case study narrative for interviews and portfolio work.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn-secondary" type="button" on:click={() => goToStep(2)}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M9 3L5 7l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back
          </button>
          <div class="actions-right">
            <span class="step-counter">Step 3 of 3</span>
            <button class="btn-primary" type="button" on:click={handleGenerate}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="white">
                <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z"/>
              </svg>
              Generate outputs
            </button>
          </div>
        </div>
      </div>
    {/if}
  {/if}

</div>

<style>
  .page { max-width: 680px; margin: 0 auto; padding: 48px 24px 100px; }

  .step { display: flex; flex-direction: column; }

  .field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 28px; }

  .field-label {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--orange);
  }

  .field-prompt {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.65;
  }

  :global(.field-prompt strong) { color: var(--text-primary); font-weight: 500; }
  :global(.field-prompt em) { font-style: italic; }

  textarea.short { min-height: 90px; }
  textarea.medium { min-height: 120px; }

  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

  .pill-group { display: flex; gap: 8px; flex-wrap: wrap; }

  .pill {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.05em;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: opacity 0.15s, transform 0.1s;
    opacity: 0.38;
    user-select: none;
  }

  .pill:hover { opacity: 0.7; transform: translateY(-1px); }
  .pill.active { opacity: 1; }
  .pill.activation { background: var(--teal); color: var(--teal-text); border-color: rgba(45, 212, 191, 0.25); }
  .pill.conversion { background: var(--orange-bg); color: var(--orange); border-color: var(--orange-border); }
  .pill.retention  { background: var(--blue-bg); color: var(--blue-text); border-color: rgba(96, 165, 250, 0.3); }
  .pill.revenue    { background: var(--green-bg); color: var(--green-text); border-color: rgba(74, 222, 128, 0.3); }

  .step-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }

  .actions-right { display: flex; align-items: center; gap: 12px; }

  .step-counter {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
  }

  .divider { height: 1px; background: var(--border); margin: 32px 0; }

  .output-preview { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }

  .output-mode {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
  }

  .output-num {
    font-family: var(--font-mono);
    font-size: 10px;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .output-num.one   { background: var(--orange-bg); color: var(--orange); }
  .output-num.two   { background: var(--green-bg); color: var(--green-text); }
  .output-num.three { background: rgba(167, 139, 250, 0.12); color: #a78bfa; }

  .output-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
  .output-desc  { font-size: 12px; color: var(--text-secondary); line-height: 1.4; }
</style>
