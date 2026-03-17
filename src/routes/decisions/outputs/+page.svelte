<script lang="ts">
  import { outputsStore } from '$lib/stores/outputs';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { marked } from 'marked';

  let outputs = $state(null);

  onMount(() => {
    const unsubscribe = outputsStore.subscribe((value) => {
      if (!value) {
        goto('/decisions/new');
        return;
      }
      outputs = value;
    });
    return unsubscribe;
  });

  function renderMarkdown(text: string): string {
    return marked(text) as string;
  }
</script>

{#if outputs}
  <div class="page">
    <div class="page-header">
      <a class="back-btn" href="/decisions/new" aria-label="New decision">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 11L5 7l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
      <div>
        <h1 class="page-title">Your outputs</h1>
        <p class="page-subtitle">Three views of the same decision</p>
      </div>
    </div>

    <div class="outputs">

      <div class="output-block">
        <div class="output-header">
          <span class="output-num one">1</span>
          <div>
            <div class="output-title">Prepare Decision</div>
            <div class="output-desc">For you. Before you commit.</div>
          </div>
        </div>
        <div class="output-body prose">
          {@html renderMarkdown(outputs.prepare)}
        </div>
      </div>

      <div class="output-block">
        <div class="output-header">
          <span class="output-num two">2</span>
          <div>
            <div class="output-title">Communicate to Leadership</div>
            <div class="output-desc">Exec-ready. No design jargon.</div>
          </div>
        </div>
        <div class="output-body prose">
          {@html renderMarkdown(outputs.communicate)}
        </div>
      </div>

      <div class="output-block">
        <div class="output-header">
          <span class="output-num three">3</span>
          <div>
            <div class="output-title">Portfolio Case</div>
            <div class="output-desc">Structured narrative for interviews.</div>
          </div>
        </div>
        <div class="output-body prose">
          {@html renderMarkdown(outputs.portfolio)}
        </div>
      </div>

    </div>
  </div>
{/if}

<style>
  .page { max-width: 760px; margin: 0 auto; padding: 48px 24px 100px; }

  .page-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 48px;
  }

  .back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
    text-decoration: none;
    flex-shrink: 0;
  }

  .back-btn:hover { border-color: var(--border-focus); color: var(--text-primary); }

  .page-title {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 1;
    margin-bottom: 5px;
  }

  .page-subtitle {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-secondary);
  }

  .outputs { display: flex; flex-direction: column; gap: 24px; }

  .output-block {
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    overflow: hidden;
  }

  .output-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }

  .output-num {
    font-family: var(--font-mono);
    font-size: 11px;
    width: 24px;
    height: 24px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .output-num.one   { background: var(--orange-bg); color: var(--orange); }
  .output-num.two   { background: var(--green-bg); color: var(--green-text); }
  .output-num.three { background: rgba(167, 139, 250, 0.12); color: #a78bfa; }

  .output-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    margin-bottom: 2px;
  }

  .output-desc {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .output-body {
    padding: 24px;
  }

  /* Prose styles for markdown output */
  .prose :global(h2) {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
    font-family: var(--font-mono);
    margin-bottom: 10px;
    margin-top: 24px;
  }

  .prose :global(h2:first-child) { margin-top: 0; }

  .prose :global(p) {
    font-size: 14px;
    color: var(--text-primary);
    line-height: 1.7;
    margin-bottom: 12px;
  }

  .prose :global(ul),
  .prose :global(ol) {
    padding-left: 20px;
    margin-bottom: 12px;
  }

  .prose :global(li) {
    font-size: 14px;
    color: var(--text-primary);
    line-height: 1.7;
    margin-bottom: 6px;
  }

  .prose :global(strong) {
    color: var(--text-primary);
    font-weight: 600;
  }

  .prose :global(em) {
    font-style: italic;
    color: var(--text-secondary);
  }
</style>