<script>
  export let onStart; // (audience: { id: string, label: string }) => void

  const audiences = [
    {
      id: 'ceo',
      label: 'CEO',
      icon: '🎯',
      description: 'Business impact, risk, and strategic fit. No design jargon. One decision, clearly framed in terms of revenue, growth, or competitive position.',
      available: true
    },
    {
      id: 'cpo',
      label: 'CPO',
      icon: '📦',
      description: 'Product rationale, user insight, and metric impact. Deeper on tradeoffs and how this fits the product strategy.',
      available: false
    },
    {
      id: 'cfo',
      label: 'CFO',
      icon: '📊',
      description: 'Cost of inaction, expected return, and resource justification. Framed around financial impact and efficiency.',
      available: false
    },
    {
      id: 'eng',
      label: 'Engineering Lead',
      icon: '⚙️',
      description: 'Technical dependencies, implementation complexity, and risk to existing systems.',
      available: false
    }
  ];

  let selected = audiences[0];

  function select(a) {
    if (!a.available) return;
    selected = a;
  }

  function start() {
    onStart(selected);
  }
</script>

<div class="gate">
  <div class="intro">
    <h2>Who are you communicating this decision to?</h2>
    <p>Your answer shapes everything — the questions you'll be asked, the framing of your outputs, and the language that will land. Choose before you start.</p>
  </div>

  <div class="cards">
    {#each audiences as a}
      <button
        class="card"
        class:active={selected.id === a.id}
        class:disabled={!a.available}
        on:click={() => select(a)}
        type="button"
        aria-disabled={!a.available}
      >
        <span class="icon">{a.icon}</span>
        <div class="body">
          <div class="title">
            {a.label}
            {#if !a.available}
              <span class="soon">Soon</span>
            {/if}
          </div>
          <div class="desc">{a.description}</div>
        </div>
        <div class="check" aria-hidden="true"></div>
      </button>
    {/each}
  </div>

  <div class="actions">
    <button class="btn-primary" on:click={start} type="button">
      Start with {selected.label}
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <path d="M5 3l4 4-4 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</div>

<style>
  .gate { display: flex; flex-direction: column; gap: 0; }

  .intro { margin-bottom: 32px; }
  .intro h2 { font-size: 17px; font-weight: 600; letter-spacing: -0.03em; color: var(--text-primary); margin-bottom: 8px; }
  .intro p { font-size: 13px; color: var(--text-secondary); line-height: 1.65; max-width: 520px; }

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
  .card.disabled { opacity: 0.35; cursor: not-allowed; }

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
    font-size: 15px;
  }

  .card.active .icon { background: var(--orange-bg); border-color: var(--orange-border); }

  .body { flex: 1; }

  .title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card.active .title { color: var(--orange); }

  .desc { font-size: 12px; color: var(--text-secondary); line-height: 1.55; }

  .soon {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--border);
    color: var(--text-muted);
    font-weight: 400;
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
