<!--
  Audience selection gate shown before the decision steps. User picks an audience (e.g. CEO)
  and may optionally pick an intent (e.g. prove-impact) to tailor prompts.
  Props: onStart(audience, intent) — called with selected audience + optional intent.
-->
<script lang="ts">
	import { strings } from '$lib/strings.js';

	type AudienceSelection = {
		id: string;
		label: string;
		icon: string;
		description: string;
		available: boolean;
	};

	type IntentOption = {
		id: string;
		label: string;
	};

	let { onStart } = $props<{
		onStart: (audience: AudienceSelection, intent: string | null) => void;
	}>();

	const audiences = strings.audienceGate.audiences;
	const intentGate = strings.newDecision.intentGate;
	const intents = intentGate.intents as IntentOption[];

	let selected = $state(audiences[0]);
	let selectedIntent = $state<string | null>(null);

	function select(a: any) {
		if (!a.available) return;
		selected = a;
	}

	function start() {
		onStart(selected, selectedIntent);
	}

	function skipIntentSelection() {
		selectedIntent = null;
	}

	function selectIntent(intentId: string) {
		selectedIntent = selectedIntent === intentId ? null : intentId;
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

	<div class="intent-section">
		<h3>{intentGate.title}</h3>
		<p>{intentGate.subtitle}</p>
		<div class="intent-pills">
			{#each intents as intent}
				<button
					type="button"
					class="intent-pill"
					class:active={selectedIntent === intent.id}
					onclick={() => selectIntent(intent.id)}
				>
					{intent.label}
				</button>
			{/each}
			<button
				type="button"
				class="intent-pill intent-skip"
				class:active={selectedIntent === null}
				onclick={skipIntentSelection}
			>
				{intentGate.skip}
			</button>
		</div>
	</div>

	<div class="actions">
		<button class="btn-primary" onclick={start} type="button">
			{strings.audienceGate.startWith.replace('{label}', selected.label)}
			<svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
				<path
					d="M5 3l4 4-4 4"
					stroke="white"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
	</div>
</div>

<style>
	.gate {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.intro {
		margin-bottom: 32px;
	}
	.intro h2 {
		font-size: var(--text-xxl);
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--text-primary);
		margin-bottom: 8px;
	}
	.intro p {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.65;
		max-width: 600px;
	}

	.cards {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 32px;
	}

	.card {
		display: flex;
		align-items: flex-start;
		gap: 16px;
		padding: 18px 20px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
		cursor: pointer;
		transition:
			border-color 0.15s,
			background 0.15s;
		text-align: left;
		width: 100%;
	}

	.card:hover:not(.disabled) {
		border-color: var(--border-focus);
		background: var(--surface-2);
	}
	.card.active {
		border-color: var(--orange);
		background: rgba(249, 115, 22, 0.05);
	}
	.card.disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
	.card:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

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

	.card.active .icon {
		background: var(--orange-bg);
		border-color: var(--orange-border);
	}

	.body {
		flex: 1;
	}

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

	.card.active .title {
		color: var(--accent-text-orange);
	}

	.desc {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.55;
	}

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

	.actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.intent-section {
		border-top: 1px solid var(--border);
		padding-top: 24px;
		margin-bottom: 28px;
	}

	.intent-section h3 {
		font-size: var(--text-base);
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--text-primary);
		margin-bottom: 6px;
	}

	.intent-section p {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.55;
		margin-bottom: 12px;
	}

	.intent-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.intent-pill {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: 0.05em;
		min-height: 40px;
		padding: 9px 12px;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--text-secondary);
		cursor: pointer;
		transition:
			border-color 0.15s,
			color 0.15s,
			background 0.15s;
	}

	.intent-pill:hover {
		border-color: var(--border-focus);
		color: var(--text-primary);
	}

	.intent-pill.active {
		border-color: var(--orange-border);
		background: var(--orange-bg);
		color: var(--accent-text-orange);
	}

	.intent-pill.intent-skip {
		background: transparent;
		color: var(--text-muted);
		border-style: dashed;
		opacity: 0.85;
	}

	.intent-pill.intent-skip:hover {
		background: transparent;
		border-color: var(--border);
		color: var(--text-muted);
		opacity: 1;
	}

	.intent-pill.intent-skip.active {
		border-color: var(--border);
		background: transparent;
		color: var(--text-muted);
		box-shadow: none;
	}
</style>
