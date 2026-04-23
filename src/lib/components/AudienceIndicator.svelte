<!--
  Shows current audience in the steps header; clicking it resets back to the gate. Used on /decisions/new when phase === 'steps'.
  Props: label (audience label, e.g. "CEO"), onReset() — called when user clicks to change audience.
-->
<script>
  import { strings } from '$lib/strings.js';

  let { label = 'CEO', onReset } = $props();
</script>

<button class="indicator" onclick={onReset} type="button" aria-label={strings.audienceIndicator.startFreshAria}>
  <span class="label">{strings.audienceIndicator.label}</span>
  <span class="value">{label}</span>
  <span class="change">{strings.audienceIndicator.startFresh}</span>
</button>

<style>
  .indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
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
  .indicator:focus-visible { outline: 2px solid var(--orange); outline-offset: 2px; }

  .label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .value {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--orange);
    font-weight: 500;
  }

  .change {
    margin-left: auto;
    font-size: var(--text-xs);
    color: var(--text-muted);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
