<script lang="ts">
	import { strings } from '$lib/strings.js';
	import { writeInputDepth, type InputDepth } from '$lib/stores/input-depth';

	const d = strings.inputDepth;

	let { compact = false }: { compact?: boolean } = $props();

	function choose(depth: InputDepth) {
		writeInputDepth(depth);
		window.location.href = `/decisions/new?depth=${depth}`;
	}
</script>

<div class="chooser" class:compact role="group" aria-label={d.groupAria}>
	<p class="chooser-label">{d.prompt}</p>
	<div class="chooser-cards">
		<button class="depth-card" type="button" onclick={() => choose('quick')}>
			<span class="depth-badge">{d.quickBadge}</span>
			<span class="depth-title">{d.quickLabel}</span>
			<span class="depth-desc">{d.quickDesc}</span>
		</button>
		<button class="depth-card depth-card--featured" type="button" onclick={() => choose('full')}>
			<span class="depth-badge">{d.fullBadge}</span>
			<span class="depth-title">{d.fullLabel}</span>
			<span class="depth-desc">{d.fullDesc}</span>
		</button>
	</div>
</div>

<style>
	.chooser {
		margin-top: 8px;
	}

	.chooser.compact .chooser-label {
		margin-bottom: 12px;
	}

	.chooser-label {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.6;
		margin-bottom: 16px;
		max-width: 560px;
	}

	.chooser-cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	@media (max-width: 640px) {
		.chooser-cards {
			grid-template-columns: 1fr;
		}
	}

	.depth-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		padding: 16px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
		cursor: pointer;
		text-align: left;
		transition:
			border-color 0.15s,
			background 0.15s;
	}

	.depth-card:hover {
		border-color: var(--border-focus);
		background: var(--surface-2);
	}

	.depth-card:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	.depth-card--featured {
		border-color: var(--orange-border);
		background: var(--orange-dim);
	}

	.depth-badge {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.depth-card--featured .depth-badge {
		color: var(--accent-text-orange);
	}

	.depth-title {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-primary);
	}

	.depth-desc {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.55;
	}
</style>
