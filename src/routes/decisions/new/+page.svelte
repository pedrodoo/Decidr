<!--
  Decision input flow: audience gate → 3 steps (Context, Analysis, Outcomes) with inline coaching → Generate.
  Phases: gate (pick audience) | steps (form + coach blocks). All copy from $lib/strings.js (newDecision, audienceGate).
-->
<script lang="ts">
  import AudienceGate from '$lib/components/AudienceGate.svelte';
  import AudienceIndicator from '$lib/components/AudienceIndicator.svelte';
  import StepProgress from '$lib/components/StepProgress.svelte';
  import { strings } from '$lib/strings.js';
  import { inputStore } from '$lib/stores/input';
  import { outputsStore } from '../../../lib/stores/outputs';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  import { onMount } from 'svelte';
  onMount(() => {
    outputsStore.set({} as any);
    const stored = get(inputStore);
    if (stored) {
      audience = stored.audience;
      form = { ...stored.form };
      phase = 'steps';
    }
  });

  type Phase = 'gate' | 'steps';
  type Step = 1 | 2 | 3;
  type AudienceSelection = { id: string; label: string; icon: string; description: string; available: boolean };

  // --- State ---
  let phase = $state<Phase>('gate');
  let audience = $state<AudienceSelection>({
    id: 'ceo',
    label: 'CEO',
    icon: '',
    description: '',
    available: true
  });
  let currentStep = $state<Step>(1);

  // Coach visibility per step
  let coachVisible = $state<Record<Step, boolean>>({ 1: false, 2: false, 3: false });

  // Form values
  let form = $state({
    decision: '',
    problem: '',
    businessArea: '',
    options: '',
    data: '',
    tradeoffs: '',
    primaryMetric: '',
    guardrailMetric: '',
    expectedOutcome: ''
  });

  let fieldValidation = $state<Record<string, string>>({});

  function validate(step: Step) {
    const next: Record<string, string> = {};
    if (step === 1) {
      if (!form.decision.trim()) next.decision = "Looks empty — without this the output won't have much to work with.";
      if (!form.problem.trim()) next.problem = "Looks empty — without this the output won't have much to work with.";
    }
    if (step === 2) {
      if (!form.options.trim()) {
        next.options = "Looks empty — without this the output won't have much to work with.";
      } else if (form.options.split('\n').filter(l => l.trim().length > 2).length < 2) {
        next.options = "We only detected one option — usually we'd expect to see alternatives here.";
      }
      if (!form.data.trim()) next.data = "Looks empty — without evidence, the output may feel thin.";
      if (!form.tradeoffs.trim()) next.tradeoffs = "Nothing here — outputs tend to be stronger when tradeoffs are acknowledged.";
    }
    if (step === 3) {
      if (!form.primaryMetric.trim()) {
        next.primaryMetric = "Looks empty — without a metric, success is hard to define.";
      } else if (!/[\d%]/.test(form.primaryMetric)) {
        next.primaryMetric = "No number or % detected — a metric without a target is hard to evaluate.";
      }
      if (!form.guardrailMetric.trim()) next.guardrailMetric = "Nothing here — consider what you're not willing to sacrifice.";
      if (!form.expectedOutcome.trim()) next.expectedOutcome = "Looks empty — without a prediction, the output has less to anchor to.";
    }
    fieldValidation = next;
  }

  const s = strings.newDecision;
  const businessAreas = s.businessAreas;
  const prompts = s.prompts as Record<string, any>;
  const coachContent = s.coachContent as Record<string, any>;

  function stepCounter(current: number, total: number) {
    return s.stepCounter.replace('{current}', String(current)).replace('{total}', String(total));
  }

  // --- Handlers ---
  function handleAudienceStart(selected: AudienceSelection) {
    audience = selected;
    phase = 'steps';
  }

  function handleAudienceReset() {
    inputStore.clear();
    form = {
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
    phase = 'gate';
    currentStep = 1;
    coachVisible = { 1: false, 2: false, 3: false };
    fieldValidation = {};
  }

  function submitStep(n: Step) {
    validate(n);
    coachVisible[n] = true;
    setTimeout(() => {
      document.getElementById(`coach-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }

  function goToStep(n: Step) {
    fieldValidation = {};
    currentStep = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setArea(id: string) {
    form.businessArea = id;
  }

  // POST form data to POST /api/decisions/generate, then navigate to outputs page.
  let loading = $state(false);
  let generateError = $state<string | null>(null);

  async function handleGenerate() {
    validate(3);
    loading = true;
    generateError = null;

    try {
      const url = '/api/decisions/generate';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'confidence',
          input: {
            audience: audience.id,
            audienceLabel: audience.label,
            ...form
          }
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message ?? 'Something went wrong');
      }

      const result = await response.json();
      outputsStore.set({ confidence: result.confidence });
      inputStore.set({ audience, form });
      goto('/decisions/outputs');

    } catch (e) {
      generateError = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      loading = false;
    }
  }

  // Convenience: get current audience's prompts
  const p = $derived(prompts[audience.id] ?? prompts.ceo);
  const c = $derived(coachContent[audience.id] ?? coachContent.ceo);
</script>

<svelte:head>
  <title>{s.pageTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<main id="main" class="page">
  <h1 class="sr-only">New Decision</h1>

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
          <label class="field-label" for="f-decision">{s.fieldLabels.decision}</label>
          <p class="field-prompt">{@html p.decision}</p>
          <input
            id="f-decision"
            type="text"
            class:warned={!!fieldValidation.decision}
            bind:value={form.decision}
            placeholder={s.placeholders.decision}
          />
          {#if fieldValidation.decision}
            <p class="field-message">{fieldValidation.decision}</p>
          {/if}
        </div>

        <div class="field">
          <label class="field-label" for="f-problem">{s.fieldLabels.problem}</label>
          <p class="field-prompt">{@html p.problem}</p>
          <textarea
            id="f-problem"
            class="short"
            class:warned={!!fieldValidation.problem}
            bind:value={form.problem}
            placeholder={s.placeholders.problem}
          ></textarea>
          {#if fieldValidation.problem}
            <p class="field-message">{fieldValidation.problem}</p>
          {/if}
        </div>

        <fieldset class="field fieldset-reset">
          <legend class="field-label">{s.fieldLabels.businessArea}</legend>
          <p class="field-prompt">{s.fieldLabels.businessAreaPrompt}</p>
          <div class="pill-group">
            {#each businessAreas as area}
              <button
                type="button"
                class="pill {area.class}"
                class:active={form.businessArea === area.id}
                onclick={() => setArea(area.id)}
              >
                {area.label}
              </button>
            {/each}
          </div>
        </fieldset>

        {#if coachVisible[1] && Object.keys(fieldValidation).length > 0}
          <p class="validation-disclaimer">These are rule-based checks, not a full review — you know your context better than we do.</p>
        {/if}

        <div class="step-actions">
          <span class="step-counter">{stepCounter(1, 3)}</span>
          <button class="btn-primary" type="button" onclick={() => submitStep(1)}>
            {strings.common.continue}
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M5 3l4 4-4 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        {#if coachVisible[1]}
          <div id="coach-1" class="coach-placeholder">
            <div class="coach-placeholder-header">
              <span class="coach-placeholder-badge">Coming soon</span>
              <span class="coach-placeholder-title">Input-aware coaching</span>
            </div>
            <p class="coach-placeholder-body">Based on what you've written, this space will surface questions worth sitting with before you move on — gaps in your reasoning, assumptions to pressure-test, and angles a {audience.label} will likely push back on. Powered by NLP analysis of your specific inputs, not preset prompts.</p>
            <p class="coach-placeholder-sub">For now, take a moment to re-read what you've written above.</p>
            <button class="btn-primary" type="button" onclick={() => goToStep(2)}>Continue to Analysis →</button>
          </div>
        {/if}
      </div>
    {/if}

    <!-- STEP 2: ANALYSIS -->
    {#if currentStep === 2}
      <div class="step">
        <div class="field">
          <label class="field-label" for="f-options">{s.fieldLabels.options}</label>
          <p class="field-prompt">{@html p.options}</p>
          <textarea id="f-options" class="medium" class:warned={!!fieldValidation.options} bind:value={form.options} placeholder={s.placeholders.options}></textarea>
          {#if fieldValidation.options}
            <p class="field-message">{fieldValidation.options}</p>
          {/if}
        </div>

        <div class="field">
          <label class="field-label" for="f-data">{s.fieldLabels.data}</label>
          <p class="field-prompt">{@html p.data}</p>
          <textarea id="f-data" class="short" class:warned={!!fieldValidation.data} bind:value={form.data} placeholder={s.placeholders.data}></textarea>
          {#if fieldValidation.data}
            <p class="field-message">{fieldValidation.data}</p>
          {/if}
        </div>

        <div class="field">
          <label class="field-label" for="f-tradeoffs">{s.fieldLabels.tradeoffs}</label>
          <p class="field-prompt">{@html p.tradeoffs}</p>
          <textarea id="f-tradeoffs" class="short" class:warned={!!fieldValidation.tradeoffs} bind:value={form.tradeoffs} placeholder={s.placeholders.tradeoffs}></textarea>
          {#if fieldValidation.tradeoffs}
            <p class="field-message">{fieldValidation.tradeoffs}</p>
          {/if}
        </div>

        {#if coachVisible[2] && Object.keys(fieldValidation).length > 0}
          <p class="validation-disclaimer">These are rule-based checks, not a full review — you know your context better than we do.</p>
        {/if}

        <div class="step-actions">
          <button class="btn-secondary" type="button" onclick={() => goToStep(1)}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 3L5 7l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {strings.common.back}
          </button>
          <div class="actions-right">
            <span class="step-counter">{stepCounter(2, 3)}</span>
            <button class="btn-primary" type="button" onclick={() => submitStep(2)}>
              {strings.common.continue}
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M5 3l4 4-4 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {#if coachVisible[2]}
          <div id="coach-2" class="coach-placeholder">
            <div class="coach-placeholder-header">
              <span class="coach-placeholder-badge">Coming soon</span>
              <span class="coach-placeholder-title">Input-aware coaching</span>
            </div>
            <p class="coach-placeholder-body">Based on what you've written, this space will surface questions worth sitting with before you move on — gaps in your reasoning, assumptions to pressure-test, and angles a {audience.label} will likely push back on. Powered by NLP analysis of your specific inputs, not preset prompts.</p>
            <p class="coach-placeholder-sub">For now, take a moment to re-read what you've written above.</p>
            <button class="btn-primary" type="button" onclick={() => goToStep(3)}>Continue to Outcomes →</button>
          </div>
        {/if}
      </div>
    {/if}

    <!-- STEP 3: OUTCOMES -->
    {#if currentStep === 3}
      <div class="step">
        <div class="field-row">
          <div class="field">
            <label class="field-label" for="f-metric">{s.fieldLabels.primaryMetric}</label>
            <p class="field-prompt">{@html p.primaryMetric}</p>
            <input id="f-metric" type="text" class:warned={!!fieldValidation.primaryMetric} bind:value={form.primaryMetric} placeholder={s.placeholders.primaryMetric} />
            {#if fieldValidation.primaryMetric}
              <p class="field-message">{fieldValidation.primaryMetric}</p>
            {/if}
          </div>
          <div class="field">
            <label class="field-label" for="f-guardrail">{s.fieldLabels.guardrailMetric}</label>
            <p class="field-prompt">{@html p.guardrailMetric}</p>
            <input id="f-guardrail" type="text" class:warned={!!fieldValidation.guardrailMetric} bind:value={form.guardrailMetric} placeholder={s.placeholders.guardrailMetric} />
            {#if fieldValidation.guardrailMetric}
              <p class="field-message">{fieldValidation.guardrailMetric}</p>
            {/if}
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="f-outcome">{s.fieldLabels.expectedOutcome}</label>
          <p class="field-prompt">{@html p.expectedOutcome}</p>
          <input id="f-outcome" type="text" class:warned={!!fieldValidation.expectedOutcome} bind:value={form.expectedOutcome} placeholder={s.placeholders.expectedOutcome} />
          {#if fieldValidation.expectedOutcome}
            <p class="field-message">{fieldValidation.expectedOutcome}</p>
          {/if}
        </div>

        <div class="divider"></div>

        <div class="field">
          <div class="field-label">{s.fieldLabels.whatYouGet}</div>
          <p class="field-prompt">{s.fieldLabels.whatYouGetPrompt}</p>
          <div class="output-preview">
            <div class="output-mode">
              <span class="output-num one">1</span>
              <div>
                <div class="output-title">{s.outputPreview.oneTitle}</div>
                <div class="output-desc">{s.outputPreview.oneDesc}</div>
              </div>
            </div>
            <div class="output-mode">
              <span class="output-num two">2</span>
              <div>
                <div class="output-title">{s.outputPreview.twoTitle}</div>
                <div class="output-desc">{s.outputPreview.twoDesc.replace('{audienceLabel}', audience.label)}</div>
              </div>
            </div>
            <div class="output-mode">
              <span class="output-num three">3</span>
              <div>
                <div class="output-title">{s.outputPreview.threeTitle}</div>
                <div class="output-desc">{s.outputPreview.threeDesc}</div>
              </div>
            </div>
          </div>
        </div>

        {#if Object.keys(fieldValidation).length > 0}
          <p class="validation-disclaimer">These are rule-based checks, not a full review — you know your context better than we do.</p>
        {/if}

        <div class="step-actions">
          <span class="step-counter">{stepCounter(3, 3)}</span>
          <button class="btn-primary" type="button" onclick={handleGenerate} disabled={loading}>
            {#if loading}
              Generating...
            {:else}
              <svg width="13" height="13" viewBox="0 0 16 16" fill="white" aria-hidden="true">
                <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z"/>
              </svg>
              {s.generateOutputs}
            {/if}
          </button>
        </div>
        {#if generateError}
          <p class="generate-error">{generateError}</p>
        {/if}
      </div>
    {/if}
  {/if}

</main>

<style>
  .page {
    max-width: 760px;
    margin: 0 auto;
    padding: 48px 24px 100px;
    position: relative;
    z-index: 10000;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .step { display: flex; flex-direction: column; position: relative; z-index: 1; }

  .field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 28px; }

  /* Ensure inputs sit above any external overlay (e.g. devtools/Cursor highlight) so they receive focus and input */
  .field input,
  .field textarea {
    position: relative;
    z-index: 10000;
  }

  .fieldset-reset {
    border: 0;
    padding: 0;
    margin: 0 0 28px 0;
    min-width: 0;
  }

  .field-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--orange);
  }

  .field-prompt {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.65;
  }

  .generate-error {
    font-size: 13px;
    color: #f87171;
    margin-top: 12px;
  }

  :global(.field-prompt strong) { color: var(--text-primary); font-weight: 500; }
  :global(.field-prompt em) { font-style: italic; }

  textarea.short { min-height: 90px; }
  textarea.medium { min-height: 120px; }

  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

  .pill-group { display: flex; gap: 8px; flex-wrap: wrap; }

  .pill {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: 0.05em;
    min-height: 44px;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: opacity 0.15s, transform 0.1s;
    opacity: 0.38;
    user-select: none;
  }

  .pill:hover { opacity: 0.7; transform: translateY(-1px); }
  .pill.active { opacity: 1; }
  .pill:focus-visible { outline: 2px solid var(--orange); outline-offset: 2px; }
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
    font-size: var(--text-xs);
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
    font-size: 12px;
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

  .output-title { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
  .output-desc  { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.4; }

  /* Field validation */
  :global(input.warned), :global(textarea.warned) { border-color: var(--orange) !important; }
  .field-message {
    font-size: 12px;
    color: var(--orange);
    line-height: 1.4;
    margin-top: 2px;
  }
  .validation-disclaimer {
    font-size: 12px;
    color: var(--text-muted);
    font-style: italic;
    margin-bottom: 16px;
  }

  /* Coach placeholder */
  .coach-placeholder {
    margin-top: 32px;
    padding: 24px;
    border: 1px dashed var(--border);
    border-radius: 10px;
    background: var(--surface);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .coach-placeholder-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .coach-placeholder-badge {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 2px 6px;
  }
  .coach-placeholder-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-muted);
  }
  .coach-placeholder-body {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.65;
  }
  .coach-placeholder-sub {
    font-size: 12px;
    color: var(--text-muted);
    font-style: italic;
  }
</style>
