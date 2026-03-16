<script>
  export let label = 'CEO';
  export let onReset; // () => void
</script>

<button class="indicator" on:click={onReset} type="button" aria-label="Change audience">
  <span class="label">Audience</span>
  <span class="value">{label}</span>
  <span class="change">Change</span>
</button>

<style>
  .indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: var(--orange-bg);
    border: 1px solid var(--orange-border);
    border-radius: 7px;
    margin-bottom: 32px;
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: background 0.15s;
  }

  .indicator:hover { background: rgba(249, 115, 22, 0.16); }

  .label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .value {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--orange);
    font-weight: 500;
  }

  .change {
    margin-left: auto;
    font-size: 11px;
    color: var(--text-muted);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
