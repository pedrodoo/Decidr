<script lang="ts">
	import { autoresize } from '$lib/actions/autoresize';
	import { tick } from 'svelte';
	import { strings } from '$lib/strings.js';
	import type { DecisionForm } from '$lib/decisions/storage';

	type InputDepth = 'quick' | 'full';

	let {
		form = $bindable(),
		fieldValidation = $bindable({}),
		inputDepth = 'full',
		audienceId = 'ceo',
		intent = '',
		idPrefix = 'dif'
	}: {
		form: DecisionForm;
		fieldValidation?: Record<string, string>;
		inputDepth?: InputDepth;
		audienceId?: string;
		intent?: string;
		idPrefix?: string;
	} = $props();

	const s = strings.newDecision;
	const depthCopy = strings.inputDepth;
	const businessAreas = s.businessAreas;
	const prompts = s.prompts as Record<string, Record<string, string>>;
	const promptKey = $derived(intent ? `${audienceId}:${intent}` : audienceId);
	const p = $derived(prompts[promptKey] ?? prompts[audienceId] ?? prompts.ceo);

	const businessAreaLegendId = $derived(`${idPrefix}-business-area-label`);
	const businessAreaPromptId = $derived(`${idPrefix}-business-area-prompt`);

	function businessAreaPillId(areaId: string) {
		return `${idPrefix}-biz-${areaId}`;
	}

	function businessAreaTabIndex(index: number): 0 | -1 {
		const ids = businessAreas.map((a) => a.id);
		const selIdx = form.businessArea ? ids.indexOf(form.businessArea) : -1;
		if (selIdx >= 0) return index === selIdx ? 0 : -1;
		return index === 0 ? 0 : -1;
	}

	function setArea(id: string) {
		form = { ...form, businessArea: id };
	}

	function onBusinessAreaRadioKeydown(e: KeyboardEvent, index: number) {
		const { key } = e;
		const n = businessAreas.length;
		if (n === 0) return;

		let nextIndex: number | null = null;

		if (key === 'ArrowRight' || key === 'ArrowDown') {
			e.preventDefault();
			nextIndex = (index + 1) % n;
		} else if (key === 'ArrowLeft' || key === 'ArrowUp') {
			e.preventDefault();
			nextIndex = (index - 1 + n) % n;
		} else if (key === 'Home') {
			e.preventDefault();
			nextIndex = 0;
		} else if (key === 'End') {
			e.preventDefault();
			nextIndex = n - 1;
		} else if (key === ' ') {
			e.preventDefault();
			setArea(businessAreas[index].id);
			return;
		}

		if (nextIndex === null) return;

		const next = businessAreas[nextIndex];
		setArea(next.id);
		tick().then(() => document.getElementById(businessAreaPillId(next.id))?.focus());
	}
</script>

{#if inputDepth === 'quick'}
	<div class="field">
		<label class="field-label" for="{idPrefix}-decision">{s.fieldLabels.decision}</label>
		<p class="field-prompt">{@html p.decision}</p>
		<input
			id="{idPrefix}-decision"
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
		<label class="field-label" for="{idPrefix}-problem">
			{s.fieldLabels.problem}
			<span class="optional-tag">{depthCopy.quickProblemOptional}</span>
		</label>
		<p class="field-prompt">{@html p.problem}</p>
		<textarea
			id="{idPrefix}-problem"
			use:autoresize={form.problem}
			bind:value={form.problem}
			placeholder={s.placeholders.problem}
		></textarea>
	</div>
{:else}
	<details class="section" open>
		<summary class="section-summary">{strings.stepProgress.steps[0].label}</summary>
		<div class="section-body">
			<div class="field">
				<label class="field-label" for="{idPrefix}-decision">{s.fieldLabels.decision}</label>
				<p class="field-prompt">{@html p.decision}</p>
				<input
					id="{idPrefix}-decision"
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
				<label class="field-label" for="{idPrefix}-problem">{s.fieldLabels.problem}</label>
				<p class="field-prompt">{@html p.problem}</p>
				<textarea
					id="{idPrefix}-problem"
					class:warned={!!fieldValidation.problem}
					use:autoresize={form.problem}
					bind:value={form.problem}
					placeholder={s.placeholders.problem}
				></textarea>
				{#if fieldValidation.problem}
					<p class="field-message">{fieldValidation.problem}</p>
				{/if}
			</div>

			<fieldset class="field fieldset-reset">
				<legend class="field-label" id={businessAreaLegendId}>{s.fieldLabels.businessArea}</legend>
				<p class="field-prompt" id={businessAreaPromptId}>{s.fieldLabels.businessAreaPrompt}</p>
				<div
					class="pill-group"
					role="radiogroup"
					aria-labelledby={businessAreaLegendId}
					aria-describedby={businessAreaPromptId}
				>
					{#each businessAreas as area, i (area.id)}
						<button
							type="button"
							id={businessAreaPillId(area.id)}
							class="pill {area.class}"
							class:active={form.businessArea === area.id}
							role="radio"
							aria-checked={form.businessArea === area.id}
							tabindex={businessAreaTabIndex(i)}
							onclick={() => setArea(area.id)}
							onkeydown={(e) => onBusinessAreaRadioKeydown(e, i)}
						>
							{area.label}
						</button>
					{/each}
				</div>
			</fieldset>
		</div>
	</details>

	<details class="section">
		<summary class="section-summary">{strings.stepProgress.steps[1].label}</summary>
		<div class="section-body">
			<div class="field">
				<label class="field-label" for="{idPrefix}-options">{s.fieldLabels.options}</label>
				<p class="field-prompt">{@html p.options}</p>
				<textarea
					id="{idPrefix}-options"
					class:warned={!!fieldValidation.options}
					use:autoresize={form.options}
					bind:value={form.options}
					placeholder={s.placeholders.options}
				></textarea>
				{#if fieldValidation.options}
					<p class="field-message">{fieldValidation.options}</p>
				{/if}
			</div>

			<div class="field">
				<label class="field-label" for="{idPrefix}-data">{s.fieldLabels.data}</label>
				<p class="field-prompt">{@html p.data}</p>
				<textarea
					id="{idPrefix}-data"
					class:warned={!!fieldValidation.data}
					use:autoresize={form.data}
					bind:value={form.data}
					placeholder={s.placeholders.data}
				></textarea>
				{#if fieldValidation.data}
					<p class="field-message">{fieldValidation.data}</p>
				{/if}
			</div>

			<div class="field">
				<label class="field-label" for="{idPrefix}-tradeoffs">{s.fieldLabels.tradeoffs}</label>
				<p class="field-prompt">{@html p.tradeoffs}</p>
				<textarea
					id="{idPrefix}-tradeoffs"
					class:warned={!!fieldValidation.tradeoffs}
					use:autoresize={form.tradeoffs}
					bind:value={form.tradeoffs}
					placeholder={s.placeholders.tradeoffs}
				></textarea>
				{#if fieldValidation.tradeoffs}
					<p class="field-message">{fieldValidation.tradeoffs}</p>
				{/if}
			</div>
		</div>
	</details>

	<details class="section">
		<summary class="section-summary">{strings.stepProgress.steps[2].label}</summary>
		<div class="section-body">
			<div class="field-row">
				<div class="field">
					<label class="field-label" for="{idPrefix}-metric">{s.fieldLabels.primaryMetric}</label>
					<p class="field-prompt">{@html p.primaryMetric}</p>
					<input
						id="{idPrefix}-metric"
						type="text"
						class:warned={!!fieldValidation.primaryMetric}
						bind:value={form.primaryMetric}
						placeholder={s.placeholders.primaryMetric}
					/>
					{#if fieldValidation.primaryMetric}
						<p class="field-message">{fieldValidation.primaryMetric}</p>
					{/if}
				</div>
				<div class="field">
					<label class="field-label" for="{idPrefix}-guardrail">{s.fieldLabels.guardrailMetric}</label>
					<p class="field-prompt">{@html p.guardrailMetric}</p>
					<input
						id="{idPrefix}-guardrail"
						type="text"
						class:warned={!!fieldValidation.guardrailMetric}
						bind:value={form.guardrailMetric}
						placeholder={s.placeholders.guardrailMetric}
					/>
					{#if fieldValidation.guardrailMetric}
						<p class="field-message">{fieldValidation.guardrailMetric}</p>
					{/if}
				</div>
			</div>

			<div class="field">
				<label class="field-label" for="{idPrefix}-outcome">{s.fieldLabels.expectedOutcome}</label>
				<p class="field-prompt">{@html p.expectedOutcome}</p>
				<input
					id="{idPrefix}-outcome"
					type="text"
					class:warned={!!fieldValidation.expectedOutcome}
					bind:value={form.expectedOutcome}
					placeholder={s.placeholders.expectedOutcome}
				/>
				{#if fieldValidation.expectedOutcome}
					<p class="field-message">{fieldValidation.expectedOutcome}</p>
				{/if}
			</div>
		</div>
	</details>
{/if}

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 20px;
	}

	.field:last-child {
		margin-bottom: 0;
	}

	.field-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		margin-bottom: 20px;
	}

	@media (max-width: 640px) {
		.field-row {
			grid-template-columns: 1fr;
		}
	}

	.fieldset-reset {
		border: 0;
		padding: 0;
		margin: 0 0 20px 0;
		min-width: 0;
	}

	.field-label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--accent-text-orange);
	}

	.field-prompt {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.65;
	}

	:global(.field-prompt strong) {
		color: var(--text-primary);
		font-weight: 500;
	}

	:global(.field-prompt em) {
		font-style: italic;
	}

	input,
	textarea {
		width: 100%;
		padding: 12px 14px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text-primary);
		font-size: var(--text-sm);
		line-height: 1.5;
		transition: border-color 0.15s;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: var(--border-focus);
	}

	input.warned,
	textarea.warned {
		border-color: var(--semantic-warning);
	}

	.field-message {
		font-size: 12px;
		color: var(--semantic-warning);
		line-height: 1.5;
	}

	.optional-tag {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin-left: 8px;
	}

	.pill-group {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.pill {
		padding: 8px 14px;
		border-radius: 999px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition:
			border-color 0.15s,
			background 0.15s,
			color 0.15s;
	}

	.pill.active {
		border-color: var(--border-focus);
		background: var(--surface-2);
		color: var(--text-primary);
	}

	.section {
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
		margin-bottom: 10px;
		overflow: hidden;
	}

	.section-summary {
		padding: 14px 18px;
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-secondary);
		cursor: pointer;
		list-style: none;
		user-select: none;
	}

	.section-summary::-webkit-details-marker {
		display: none;
	}

	.section-summary::before {
		content: '▸';
		display: inline-block;
		margin-right: 8px;
		transition: transform 0.15s;
	}

	.section[open] .section-summary::before {
		transform: rotate(90deg);
	}

	.section-body {
		padding: 0 18px 18px;
		border-top: 1px solid var(--border);
	}
</style>
