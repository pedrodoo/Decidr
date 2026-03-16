<script>
  export let visible = false;
  export let stepLabel = '';
  export let audienceLabel = '';
  export let intro = '';
  export let questions = []; // string[]
  export let challenge = '';
  export let challengeIsPositive = false; // true = positive framing, false = pushback
  export let onContinue; // () => void
  export let continueLabel = 'Continue';
</script>

{#if visible}
  <div class="coach" role="region" aria-label="Coaching feedback">
    <div class="header">
      <div class="avatar" aria-hidden="true">
        <svg viewBox="0 0 12 12" fill="var(--coach-accent)">
          <path d="M6 1l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/>
        </svg>
      </div>
      <span class="name">Decidr · {stepLabel} · {audienceLabel}</span>
    </div>

    <div class="body">
      <p class="intro">{@html intro}</p>

      {#if questions.length}
        <div class="questions">
          {#each questions as q}
            <div class="question">
              <span class="q-icon" aria-hidden="true">→</span>
              <span>{@html q}</span>
            </div>
          {/each}
        </div>
      {/if}

      {#if challenge}
        <div class="challenge" class:positive={challengeIsPositive}>
          {@html challenge}
        </div>
      {/if}

      <div class="footer">
        <span class="footer-text">You can revise above, or continue.</span>
        <button class="btn-primary" on:click={onContinue} type="button">
          {continueLabel}
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .coach {
    margin-top: 28px;
    border: 1px solid var(--coach-border);
    border-radius: 12px;
    background: var(--coach-bg);
    overflow: hidden;
    animation: fadeUp 0.25s ease;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 18px;
    border-bottom: 1px solid var(--coach-border);
  }

  .avatar {
    width: 22px;
    height: 22px;
    border-radius: 5px;
    background: rgba(96, 165, 250, 0.15);
    border: 1px solid var(--coach-border);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar svg { width: 11px; height: 11px; }

  .name {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--coach-accent);
  }

  .body {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .intro {
    font-size: 13px;
    color: var(--coach-text);
    line-height: 1.7;
  }

  .questions { display: flex; flex-direction: column; gap: 8px; }

  .question {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 14px;
    background: rgba(96, 165, 250, 0.05);
    border: 1px solid rgba(96, 165, 250, 0.1);
    border-radius: 8px;
    font-size: 13px;
    color: var(--coach-text);
    line-height: 1.55;
  }

  .q-icon { color: var(--coach-accent); flex-shrink: 0; margin-top: 1px; font-size: 12px; }

  .challenge {
    padding: 12px 14px;
    background: rgba(249, 115, 22, 0.07);
    border: 1px solid rgba(249, 115, 22, 0.18);
    border-radius: 8px;
    font-size: 13px;
    color: #ffd0a8;
    line-height: 1.65;
  }

  .challenge.positive {
    background: rgba(74, 222, 128, 0.07);
    border-color: rgba(74, 222, 128, 0.18);
    color: #b3f0c8;
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 4px;
    gap: 16px;
  }

  .footer-text { font-size: 12px; color: var(--text-muted); }
</style>
