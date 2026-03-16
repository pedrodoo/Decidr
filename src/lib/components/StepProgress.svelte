<script>
  export let currentStep = 1;

  const steps = [
    { n: 1, label: 'Context' },
    { n: 2, label: 'Analysis' },
    { n: 3, label: 'Outcomes' }
  ];
</script>

<div class="progress" role="list" aria-label="Decision steps">
  {#each steps as step}
    <div
      class="step"
      class:active={step.n === currentStep}
      class:completed={step.n < currentStep}
      role="listitem"
      aria-current={step.n === currentStep ? 'step' : undefined}
    >
      <div class="dot">
        {#if step.n < currentStep}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {:else}
          {step.n}
        {/if}
      </div>
      <span class="label">{step.label}</span>
    </div>
  {/each}
</div>

<style>
  .progress {
    display: flex;
    align-items: center;
    margin-bottom: 40px;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    position: relative;
  }

  .step:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 28px;
    right: 0;
    top: 14px;
    height: 1px;
    background: var(--border);
    z-index: 0;
  }

  .step.completed:not(:last-child)::after { background: var(--orange); }

  .dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-muted);
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    transition: all 0.2s;
  }

  .step.active .dot { border-color: var(--orange); background: var(--orange-dim); color: var(--orange); }
  .step.completed .dot { border-color: var(--orange); background: var(--orange); color: white; }

  .label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .step.active .label { color: var(--text-primary); }
  .step.completed .label { color: var(--text-secondary); }
</style>
