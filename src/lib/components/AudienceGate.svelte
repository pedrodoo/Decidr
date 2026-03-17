<!--
  Audience selection gate shown before the decision steps. User picks an audience (e.g. CEO); copy and coaching tone are keyed by audience.
  Props: onStart(audience) — called with { id, label } when user clicks Start. Copy from strings.audienceGate.
-->
<script lang="ts">
  import { strings } from '$lib/strings.js';

  let { onStart } = $props(); // (audience: { id: string, label: string }) => void

  const audiences = strings.audienceGate.audiences;

  let selected = $state(audiences[0]);

  function select(a: any) {
    if (!a.available) return;
    selected = a;
  }

  function start() {
    onStart(selected);
  }
</script>

<div class="gate">
  <div class="intro">
    <h2>{strings.audienceGate.title}</h2>
    <p>{strings.audienceGate.intro}</p>
  </div>

  <div class="cards">
    {#each audiences as a}
      <button
        class="card"
        class:active={selected.id === a.id}
        class:disabled={!a.available}
        onclick={() => select(a)}
        type="button"
        aria-disabled={!a.available}
      >
        <span class="icon">{a.icon}</span>
        <div class="body">
          <div class="title">
            {a.label}
            {#if !a.available}
              <span class="soon">{strings.common.soon}</span>
            {/if}
          </div>
          <div class="desc">{a.description}</div>
        </div>
        <div class="check" aria-hidden="true"></div>
      </button>
    {/each}
  </div>

  <div class="actions">
    <button class="btn-primary" onclick={start} type="button">
      {strings.audienceGate.startWith.replace('{label}', selected.label)}
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M5 3l4 4-4 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</div>

<style>
  .gate { display: flex; flex-direction: column; gap: 0; }

  .intro { margin-bottom: 32px; }
  .intro h2 { font-size: var(--text-xxl); font-weight: 600; letter-spacing: -0.03em; color: var(--text-primary); margin-bottom: 8px; }
  .intro p { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.65; max-width: 600px; }

  .cards { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }

  .card {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 18px 20px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    text-align: left;
    width: 100%;
  }

  .card:hover:not(.disabled) { border-color: var(--border-focus); background: var(--surface-2); }
  .card.active { border-color: var(--orange); background: rgba(249, 115, 22, 0.05); }
  .card.disabled { opacity: 0.55; cursor: not-allowed; }
  .card:focus-visible { outline: 2px solid var(--orange); outline-offset: 2px; }

  .icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: var(--text-base);
  }

  .card.active .icon { background: var(--orange-bg); border-color: var(--orange-border); }

  .body { flex: 1; }

  .title {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card.active .title { color: var(--orange); }

  .desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.55; }

  .soon {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 4px;
    background: var(--surface-2);
    color: var(--text-secondary);
    font-weight: 600;
    border: 1px solid var(--border);
  }

  .check {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid var(--border);
    flex-shrink: 0;
    margin-top: 2px;
    transition: all 0.15s;
    position: relative;
  }

  .card.active .check {
    background: var(--orange);
    border-color: var(--orange);
  }

  .card.active .check::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 4px;
    border-left: 1.5px solid white;
    border-bottom: 1.5px solid white;
    transform: rotate(-45deg);
    top: 5px;
    left: 5px;
  }

  .actions { display: flex; justify-content: flex-end; }
</style>
