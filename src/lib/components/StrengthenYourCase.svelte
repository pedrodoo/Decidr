<script lang="ts">
	import DecisionInputForm from '$lib/components/DecisionInputForm.svelte';
	import TrialAccessPanel from '$lib/components/TrialAccessPanel.svelte';
	import { strings } from '$lib/strings.js';
	import { applyRateLimitHeaders, parseGenerateError } from '$lib/api/generate-client';
	import {
		appendIteration,
		upsertDraft,
		type AudienceSelection,
		type DecisionForm,
		type DecisionRecord
	} from '$lib/decisions/storage';
	import { inputStore } from '$lib/stores/input';
	import type { InputDepth } from '$lib/stores/input-depth';
	import type { TrialUsage } from '$lib/server/trial-limits';
	import { invalidateAll } from '$app/navigation';

	let {
		form = $bindable(),
		audience,
		inputDepth,
		decisionId,
		hasPrepare = false,
		isTrial = false,
		canTrialGenerate = true,
		trialUsage = null,
		currentConfidence = undefined,
		fullEditorHref,
		defaultOpen = false,
		onUpdated
	}: {
		form: DecisionForm;
		audience: AudienceSelection;
		inputDepth: InputDepth;
		decisionId: string;
		hasPrepare?: boolean;
		isTrial?: boolean;
		canTrialGenerate?: boolean;
		trialUsage?: TrialUsage | null;
		currentConfidence?: string;
		fullEditorHref: string;
		defaultOpen?: boolean;
		onUpdated: (record: DecisionRecord) => void;
	} = $props();

	const copy = strings.decisionOutputs.strengthen;
	const s = strings.newDecision;

	let open = $state(defaultOpen);
	let fieldValidation = $state<Record<string, string>>({});
	let loading = $state<'confidence' | 'prepare' | null>(null);
	let error = $state<string | null>(null);

	function validateQuick(): boolean {
		const next: Record<string, string> = {};
		if (!form.decision.trim()) next.decision = s.validation.emptyGeneric;
		fieldValidation = next;
		return Object.keys(next).length === 0;
	}

	function validateFull(): boolean {
		const next: Record<string, string> = {};
		if (!form.decision.trim()) next.decision = s.validation.emptyGeneric;
		if (!form.problem.trim()) next.problem = s.validation.emptyGeneric;
		if (!form.options.trim()) {
			next.options = s.validation.emptyGeneric;
		} else if (form.options.split('\n').filter((l) => l.trim().length > 2).length < 2) {
			next.options = s.validation.optionsOneDetected;
		}
		if (!form.data.trim()) next.data = s.validation.dataEmpty;
		if (!form.tradeoffs.trim()) next.tradeoffs = s.validation.tradeoffsEmpty;
		if (!form.primaryMetric.trim()) {
			next.primaryMetric = s.validation.primaryMetricEmpty;
		} else if (!/[\d%]/.test(form.primaryMetric)) {
			next.primaryMetric = s.validation.primaryMetricNoTarget;
		}
		if (!form.guardrailMetric.trim()) next.guardrailMetric = s.validation.guardrailEmpty;
		if (!form.expectedOutcome.trim()) next.expectedOutcome = s.validation.expectedOutcomeEmpty;
		fieldValidation = next;
		return Object.keys(next).length === 0;
	}

	function persistDraft() {
		return upsertDraft({
			id: decisionId,
			audience,
			form
		});
	}

	function syncStores(record: DecisionRecord) {
		const latest = record.iterations[record.iterations.length - 1];
		if (!latest) return;
		inputStore.set({
			id: record.id,
			audience: latest.inputSnapshot.audience,
			form: latest.inputSnapshot.form
		});
		onUpdated(record);
	}

	async function recheckConfidence() {
		if (inputDepth === 'quick' ? !validateQuick() : !validateFull()) {
			open = true;
			return;
		}

		loading = 'confidence';
		error = null;

		try {
			persistDraft();

			const response = await fetch('/api/decisions/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					mode: 'confidence',
					inputDepth,
					input: {
						audience: audience.id,
						audienceLabel: audience.label,
						...form
					}
				})
			});

			applyRateLimitHeaders(response);

			if (!response.ok) {
				const err = await parseGenerateError(response);
				throw new Error(err.message ?? strings.common.somethingWentWrong);
			}

			const result = await response.json();
			const updated = appendIteration(decisionId, {
				audience,
				form,
				outputs: { confidence: result.confidence }
			});

			if (!updated) {
				throw new Error(strings.decisionOutputs.persistError);
			}

			await invalidateAll();
			syncStores(updated);
		} catch (e) {
			error = e instanceof Error ? e.message : strings.common.unknownError;
		} finally {
			loading = null;
		}
	}

	async function regeneratePrepare() {
		if (inputDepth === 'quick' ? !validateQuick() : !validateFull()) {
			open = true;
			return;
		}

		loading = 'prepare';
		error = null;

		try {
			persistDraft();

			const response = await fetch('/api/decisions/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					mode: 'prepare',
					inputDepth,
					input: {
						audience: audience.id,
						audienceLabel: audience.label,
						...form
					}
				})
			});

			applyRateLimitHeaders(response);

			if (!response.ok) {
				const err = await parseGenerateError(response);
				throw new Error(err.message ?? strings.common.somethingWentWrong);
			}

			const result = await response.json();
			const updated = appendIteration(decisionId, {
				audience,
				form,
				outputs: {
					confidence: currentConfidence,
					prepare: result.prepare
				}
			});

			if (!updated) {
				throw new Error(strings.decisionOutputs.persistError);
			}

			await invalidateAll();
			syncStores(updated);
		} catch (e) {
			error = e instanceof Error ? e.message : strings.common.unknownError;
		} finally {
			loading = null;
		}
	}
</script>

<section class="strengthen" aria-labelledby="strengthen-heading">
	<button
		type="button"
		class="strengthen-toggle"
		aria-expanded={open}
		aria-controls="strengthen-panel"
		onclick={() => (open = !open)}
	>
		<div class="strengthen-heading">
			<h2 id="strengthen-heading" class="strengthen-title">{copy.title}</h2>
			<p class="strengthen-subtitle">{copy.subtitle}</p>
		</div>
		<span class="chevron" class:open aria-hidden="true">▸</span>
	</button>

	{#if open}
		<div id="strengthen-panel" class="strengthen-panel">
			<DecisionInputForm
				bind:form
				bind:fieldValidation
				{inputDepth}
				audienceId={audience.id}
				intent={form.intent}
				idPrefix="strengthen"
			/>

			{#if Object.keys(fieldValidation).length > 0}
				<p class="validation-disclaimer">{s.validation.disclaimer}</p>
			{/if}

			{#if isTrial}
				<p class="trial-note">{strings.trial.trialLimitNote}</p>
			{/if}

			{#if isTrial && !canTrialGenerate && trialUsage}
				<TrialAccessPanel {trialUsage} variant="limit" />
			{:else}
				<div class="strengthen-actions">
					<button
						class="btn-primary"
						type="button"
						onclick={recheckConfidence}
						disabled={loading !== null || (isTrial && !canTrialGenerate)}
					>
						{loading === 'confidence' ? strings.common.generating : copy.recheckConfidence}
					</button>
					{#if hasPrepare}
						<button
							class="btn-secondary"
							type="button"
							onclick={regeneratePrepare}
							disabled={loading !== null || (isTrial && !canTrialGenerate)}
						>
							{loading === 'prepare' ? strings.common.generating : copy.regeneratePrepare}
						</button>
					{/if}
					<a class="btn-ghost-inline" href={fullEditorHref}>{copy.openFullEditor}</a>
				</div>
			{/if}

			{#if error}
				<p class="generate-error">{error}</p>
			{/if}
		</div>
	{/if}
</section>

<style>
	.strengthen {
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
		margin-bottom: 28px;
		overflow: hidden;
	}

	.strengthen-toggle {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		width: 100%;
		padding: 20px 22px;
		border: 0;
		background: transparent;
		cursor: pointer;
		text-align: left;
	}

	.strengthen-toggle:hover .strengthen-title {
		color: var(--text-primary);
	}

	.strengthen-heading {
		flex: 1;
	}

	.strengthen-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--text-secondary);
		letter-spacing: -0.02em;
		margin-bottom: 6px;
		transition: color 0.15s;
	}

	.strengthen-subtitle {
		font-size: 13px;
		color: var(--text-muted);
		line-height: 1.55;
	}

	.chevron {
		font-size: 12px;
		color: var(--text-muted);
		transition: transform 0.15s;
		margin-top: 4px;
	}

	.chevron.open {
		transform: rotate(90deg);
	}

	.strengthen-panel {
		padding: 0 22px 22px;
		border-top: 1px solid var(--border);
	}

	.validation-disclaimer {
		font-size: 12px;
		color: var(--text-muted);
		line-height: 1.55;
		margin-bottom: 16px;
	}

	.trial-note {
		font-size: var(--text-sm);
		color: var(--text-muted);
		line-height: 1.55;
		margin-bottom: 12px;
	}

	.strengthen-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		margin-top: 8px;
	}

	.btn-primary,
	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition:
			opacity 0.15s,
			background 0.15s;
	}

	.btn-primary {
		border: 0;
		background: var(--accent-orange);
		color: white;
	}

	.btn-primary:disabled,
	.btn-secondary:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.btn-secondary {
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--text-primary);
	}

	.btn-ghost-inline {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
		text-decoration: none;
		letter-spacing: -0.01em;
		transition: color 0.15s;
	}

	.btn-ghost-inline:hover {
		color: var(--text-primary);
	}

	.generate-error {
		font-size: 13px;
		color: var(--semantic-danger);
		margin-top: 12px;
	}
</style>
