<!--
  Decision input flow: audience gate → 3 steps (Context, Analysis, Outcomes) with inline coaching → Generate.
  Phases: gate (pick audience) | steps (form + coach blocks). All copy from $lib/strings.js (newDecision, audienceGate).
-->
<script lang="ts">
	import AudienceGate from '$lib/components/AudienceGate.svelte';
	import AudienceIndicator from '$lib/components/AudienceIndicator.svelte';
	import StepProgress from '$lib/components/StepProgress.svelte';
	import { strings } from '$lib/strings.js';
	import { inputStore } from '$lib/stores/input';
	import { outputsStore } from '../../../lib/stores/outputs';
	import {
		appendIteration,
		getDecision,
		upsertDraft,
		EMPTY_FORM,
		type AudienceSelection,
		type DecisionForm
	} from '$lib/decisions/storage';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import { onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import DotMatrix from '$lib/components/DotMatrix.svelte';

	type Phase = 'gate' | 'steps';
	type Step = 1 | 2 | 3;

	// --- State ---
	let phase = $state<Phase>('gate');
	let audience = $state<AudienceSelection>({
		id: 'ceo',
		label: 'CEO',
		icon: '',
		description: '',
		available: true
	});
	let currentStep = $state<Step>(1);
	let currentId = $state<string | null>(null);
	let isRefining = $state(false);
	let hydrated = $state(false);

	// Coach visibility per step
	let coachVisible = $state<Record<Step, boolean>>({ 1: false, 2: false, 3: false });

	// Form values
	let form = $state<DecisionForm>({ ...EMPTY_FORM });

	onMount(() => {
		outputsStore.set({});
		const idParam = page.url.searchParams.get('id');
		if (idParam) {
			const record = getDecision(idParam);
			if (record) {
				currentId = record.id;
				audience = { ...record.audience };
				form = { ...record.form };
				phase = 'steps';
				isRefining = true;
			}
		}
		hydrated = true;
	});

	// Debounced auto-save: persist as draft once the user has typed into the
	// primary fields (decision or problem). This avoids creating empty records
	// when the user merely opens the page.
	let saveTimer: ReturnType<typeof setTimeout> | null = null;
	$effect(() => {
		if (!hydrated) return;
		if (phase !== 'steps') return;
		const hasContent = form.decision.trim().length > 0 || form.problem.trim().length > 0;
		if (!hasContent && !currentId) return;

		// Snapshot reactive state so the timer body uses the latest values.
		const snapshot = {
			id: currentId ?? undefined,
			audience: { ...audience },
			form: { ...form }
		};

		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			const saved = upsertDraft(snapshot);
			if (saved && !currentId) {
				currentId = saved.id;
			}
		}, 600);

		return () => {
			if (saveTimer) {
				clearTimeout(saveTimer);
				saveTimer = null;
			}
		};
	});

	let fieldValidation = $state<Record<string, string>>({});

	function validate(step: Step) {
		const next: Record<string, string> = {};
		if (step === 1) {
			if (!form.decision.trim()) next.decision = s.validation.emptyGeneric;
			if (!form.problem.trim()) next.problem = s.validation.emptyGeneric;
		}
		if (step === 2) {
			if (!form.options.trim()) {
				next.options = s.validation.emptyGeneric;
			} else if (form.options.split('\n').filter((l) => l.trim().length > 2).length < 2) {
				next.options = s.validation.optionsOneDetected;
			}
			if (!form.data.trim()) next.data = s.validation.dataEmpty;
			if (!form.tradeoffs.trim()) next.tradeoffs = s.validation.tradeoffsEmpty;
		}
		if (step === 3) {
			if (!form.primaryMetric.trim()) {
				next.primaryMetric = s.validation.primaryMetricEmpty;
			} else if (!/[\d%]/.test(form.primaryMetric)) {
				next.primaryMetric = s.validation.primaryMetricNoTarget;
			}
			if (!form.guardrailMetric.trim()) next.guardrailMetric = s.validation.guardrailEmpty;
			if (!form.expectedOutcome.trim()) next.expectedOutcome = s.validation.expectedOutcomeEmpty;
		}
		fieldValidation = next;
	}

	const s = strings.newDecision;
	const businessAreas = s.businessAreas;
	const businessAreaLegendId = 'new-decision-business-area-label';
	const businessAreaPromptId = 'new-decision-business-area-prompt';

	function businessAreaPillId(areaId: string) {
		return `biz-area-${areaId}`;
	}

	function businessAreaTabIndex(index: number): 0 | -1 {
		const ids = businessAreas.map((a) => a.id);
		const selIdx = form.businessArea ? ids.indexOf(form.businessArea) : -1;
		if (selIdx >= 0) return index === selIdx ? 0 : -1;
		return index === 0 ? 0 : -1;
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
	const prompts = s.prompts as Record<string, any>;
	const coachContent = s.coachContent as Record<string, any>;

	function stepCounter(current: number, total: number) {
		return s.stepCounter.replace('{current}', String(current)).replace('{total}', String(total));
	}

	// --- Handlers ---
	function handleAudienceStart(selected: AudienceSelection) {
		audience = selected;
		phase = 'steps';
	}

	function handleAudienceReset() {
		inputStore.clear();
		form = { ...EMPTY_FORM };
		currentId = null;
		isRefining = false;
		phase = 'gate';
		currentStep = 1;
		coachVisible = { 1: false, 2: false, 3: false };
		fieldValidation = {};
	}

	function submitStep(n: Step) {
		validate(n);
		coachVisible[n] = true;
		setTimeout(() => {
			document
				.getElementById(`coach-${n}`)
				?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}, 50);
	}

	function goToStep(n: Step) {
		fieldValidation = {};
		currentStep = n;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function setArea(id: string) {
		form.businessArea = id;
	}

	// POST form data to POST /api/decisions/generate, then navigate to outputs page.
	let loading = $state(false);
	let generateError = $state<string | null>(null);
	let loadingMsgIndex = $state(0);

	const loadingMsgs = $derived(
		strings.common.generatingMessages.map((m: string) =>
			m.replace('{audienceLabel}', audience.label)
		)
	);

	$effect(() => {
		if (!loading) return;
		loadingMsgIndex = 0;
		const timer = setInterval(() => {
			loadingMsgIndex = (loadingMsgIndex + 1) % loadingMsgs.length;
		}, 2200);
		return () => clearInterval(timer);
	});

	async function handleGenerate() {
		validate(3);
		if (Object.keys(fieldValidation).length > 0) return;
		loading = true;
		generateError = null;

		try {
			// Ensure we have a persisted draft before appending an iteration so the
			// record exists even if the user reloads mid-generation.
			const drafted = upsertDraft({
				id: currentId ?? undefined,
				audience,
				form
			});
			if (drafted) currentId = drafted.id;

			const url = '/api/decisions/generate';
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					mode: 'confidence',
					input: {
						audience: audience.id,
						audienceLabel: audience.label,
						...form
					}
				})
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.message ?? strings.common.somethingWentWrong);
			}

			const result = await response.json();
			const idForIteration = currentId;
			if (!idForIteration) {
				throw new Error(strings.decisionOutputs.persistError);
			}

			const updated = appendIteration(idForIteration, {
				audience,
				form,
				outputs: { confidence: result.confidence }
			});

			outputsStore.set({ confidence: result.confidence });
			inputStore.set({ id: idForIteration, audience, form });

			const targetId = updated?.id ?? idForIteration;
			goto(`/decisions/outputs?id=${encodeURIComponent(targetId)}`);
		} catch (e) {
			generateError = e instanceof Error ? e.message : strings.common.unknownError;
		} finally {
			loading = false;
		}
	}

	// Convenience: get current audience's prompts
	const p = $derived(prompts[audience.id] ?? prompts.ceo);
	const c = $derived(coachContent[audience.id] ?? coachContent.ceo);
</script>

<svelte:head>
	<title>{s.pageTitle}</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Sora:wght@300;400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<main id="main" class="page">
	<h1 class="sr-only">{s.pageSrOnlyTitle}</h1>

	<!-- AUDIENCE GATE -->
	{#if phase === 'gate'}
		<AudienceGate onStart={handleAudienceStart} />
	{/if}

	<!-- STEPS -->
	{#if phase === 'steps'}
		<AudienceIndicator
			label={audience.label}
			onReset={handleAudienceReset}
			showResetLabel={isRefining}
		/>
		<StepProgress {currentStep} />

		<!-- STEP 1: CONTEXT -->
		{#if currentStep === 1}
			<div class="step">
				<div class="field">
					<label class="field-label" for="f-decision">{s.fieldLabels.decision}</label>
					<p class="field-prompt">{@html p.decision}</p>
					<input
						id="f-decision"
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
					<label class="field-label" for="f-problem">{s.fieldLabels.problem}</label>
					<p class="field-prompt">{@html p.problem}</p>
					<textarea
						id="f-problem"
						class="short"
						class:warned={!!fieldValidation.problem}
						bind:value={form.problem}
						placeholder={s.placeholders.problem}
					></textarea>
					{#if fieldValidation.problem}
						<p class="field-message">{fieldValidation.problem}</p>
					{/if}
				</div>

				<fieldset class="field fieldset-reset">
					<legend class="field-label" id={businessAreaLegendId}>{s.fieldLabels.businessArea}</legend
					>
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

				{#if coachVisible[1] && Object.keys(fieldValidation).length > 0}
					<p class="validation-disclaimer">
						{s.validation.disclaimer}
					</p>
				{/if}

				<div class="step-actions">
					<span class="step-counter">{stepCounter(1, 3)}</span>
					<button class="btn-primary" type="button" onclick={() => submitStep(1)}>
						{strings.common.continue}
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

				{#if coachVisible[1]}
					<div id="coach-1" class="coach-placeholder">
						<div class="coach-placeholder-header">
							<span class="coach-placeholder-badge">{s.coachPlaceholder.badge}</span>
							<span class="coach-placeholder-title">{s.coachPlaceholder.title}</span>
						</div>
						<p class="coach-placeholder-body">
							{s.coachPlaceholder.body.replace('{audienceLabel}', audience.label)}
						</p>
						<p class="coach-placeholder-sub">
							{s.coachPlaceholder.sub}
						</p>
						<button class="btn-primary" type="button" onclick={() => goToStep(2)}
							>{s.coachPlaceholder.continueToAnalysis}</button
						>
					</div>
				{/if}
			</div>
		{/if}

		<!-- STEP 2: ANALYSIS -->
		{#if currentStep === 2}
			<div class="step">
				<div class="field">
					<label class="field-label" for="f-options">{s.fieldLabels.options}</label>
					<p class="field-prompt">{@html p.options}</p>
					<textarea
						id="f-options"
						class="medium"
						class:warned={!!fieldValidation.options}
						bind:value={form.options}
						placeholder={s.placeholders.options}
					></textarea>
					{#if fieldValidation.options}
						<p class="field-message">{fieldValidation.options}</p>
					{/if}
				</div>

				<div class="field">
					<label class="field-label" for="f-data">{s.fieldLabels.data}</label>
					<p class="field-prompt">{@html p.data}</p>
					<textarea
						id="f-data"
						class="short"
						class:warned={!!fieldValidation.data}
						bind:value={form.data}
						placeholder={s.placeholders.data}
					></textarea>
					{#if fieldValidation.data}
						<p class="field-message">{fieldValidation.data}</p>
					{/if}
				</div>

				<div class="field">
					<label class="field-label" for="f-tradeoffs">{s.fieldLabels.tradeoffs}</label>
					<p class="field-prompt">{@html p.tradeoffs}</p>
					<textarea
						id="f-tradeoffs"
						class="short"
						class:warned={!!fieldValidation.tradeoffs}
						bind:value={form.tradeoffs}
						placeholder={s.placeholders.tradeoffs}
					></textarea>
					{#if fieldValidation.tradeoffs}
						<p class="field-message">{fieldValidation.tradeoffs}</p>
					{/if}
				</div>

				{#if coachVisible[2] && Object.keys(fieldValidation).length > 0}
					<p class="validation-disclaimer">
						{s.validation.disclaimer}
					</p>
				{/if}

				<div class="step-actions">
					<button class="btn-secondary" type="button" onclick={() => goToStep(1)}>
						<svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
							<path
								d="M9 3L5 7l4 4"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						{strings.common.back}
					</button>
					<div class="actions-right">
						<span class="step-counter">{stepCounter(2, 3)}</span>
						<button class="btn-primary" type="button" onclick={() => submitStep(2)}>
							{strings.common.continue}
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

				{#if coachVisible[2]}
					<div id="coach-2" class="coach-placeholder">
						<div class="coach-placeholder-header">
							<span class="coach-placeholder-badge">{s.coachPlaceholder.badge}</span>
							<span class="coach-placeholder-title">{s.coachPlaceholder.title}</span>
						</div>
						<p class="coach-placeholder-body">
							{s.coachPlaceholder.body.replace('{audienceLabel}', audience.label)}
						</p>
						<p class="coach-placeholder-sub">
							{s.coachPlaceholder.sub}
						</p>
						<button class="btn-primary" type="button" onclick={() => goToStep(3)}
							>{s.coachPlaceholder.continueToOutcomes}</button
						>
					</div>
				{/if}
			</div>
		{/if}

		<!-- STEP 3: OUTCOMES -->
		{#if currentStep === 3}
			<div class="step">
				<div class="field-row">
					<div class="field">
						<label class="field-label" for="f-metric">{s.fieldLabels.primaryMetric}</label>
						<p class="field-prompt">{@html p.primaryMetric}</p>
						<input
							id="f-metric"
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
						<label class="field-label" for="f-guardrail">{s.fieldLabels.guardrailMetric}</label>
						<p class="field-prompt">{@html p.guardrailMetric}</p>
						<input
							id="f-guardrail"
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
					<label class="field-label" for="f-outcome">{s.fieldLabels.expectedOutcome}</label>
					<p class="field-prompt">{@html p.expectedOutcome}</p>
					<input
						id="f-outcome"
						type="text"
						class:warned={!!fieldValidation.expectedOutcome}
						bind:value={form.expectedOutcome}
						placeholder={s.placeholders.expectedOutcome}
					/>
					{#if fieldValidation.expectedOutcome}
						<p class="field-message">{fieldValidation.expectedOutcome}</p>
					{/if}
				</div>

				<div class="divider"></div>

				<div class="field">
					<div class="field-label">{s.fieldLabels.whatYouGet}</div>
					<p class="field-prompt">{s.fieldLabels.whatYouGetPrompt}</p>
					{#if loading}
						<div class="output-loader">
							<DotMatrix dotSize={7} color="var(--text-primary)" gap={6} />
							<p class="output-loader-label">{strings.common.generatingLabel}</p>
							{#key loadingMsgIndex}
								<p class="output-loader-msg" in:fade={{ duration: 350 }}>
									{loadingMsgs[loadingMsgIndex]}
								</p>
							{/key}
						</div>
					{:else}
						<div class="output-preview">
							<div class="output-mode">
								<span class="output-num one">1</span>
								<div>
									<div class="output-title">{s.outputPreview.oneTitle}</div>
									<div class="output-desc">{s.outputPreview.oneDesc}</div>
								</div>
							</div>
							<div class="output-mode">
								<span class="output-num two">2</span>
								<div>
									<div class="output-title">{s.outputPreview.twoTitle}</div>
									<div class="output-desc">
										{s.outputPreview.twoDesc.replace('{audienceLabel}', audience.label)}
									</div>
								</div>
							</div>
							<div class="output-mode">
								<span class="output-num three">3</span>
								<div>
									<div class="output-title">{s.outputPreview.threeTitle}</div>
									<div class="output-desc">{s.outputPreview.threeDesc}</div>
								</div>
							</div>
						</div>
					{/if}
				</div>

				{#if Object.keys(fieldValidation).length > 0}
					<p class="validation-disclaimer">
						{s.validation.disclaimer}
					</p>
				{/if}

				<div class="step-actions">
					<span class="step-counter">{stepCounter(3, 3)}</span>
					<button class="btn-primary" type="button" onclick={handleGenerate} disabled={loading}>
						<svg width="13" height="13" viewBox="0 0 16 16" fill="white" aria-hidden="true">
							<path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" />
						</svg>
						{s.generateOutputs}
					</button>
				</div>
				{#if generateError}
					<p class="generate-error">{generateError}</p>
				{/if}
			</div>
		{/if}
	{/if}
</main>

<style>
	.page {
		max-width: 760px;
		margin: 0 auto;
		padding: 48px 24px 100px;
		position: relative;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.step {
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: 1;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 28px;
	}

	/* Ensure inputs sit above any external overlay (e.g. devtools/Cursor highlight) so they receive focus and input */
	.field input,
	.field textarea {
		position: relative;
		z-index: 10000;
	}

	.fieldset-reset {
		border: 0;
		padding: 0;
		margin: 0 0 28px 0;
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

	.generate-error {
		font-size: 13px;
		color: var(--semantic-danger);
		margin-top: 12px;
	}

	:global(.field-prompt strong) {
		color: var(--text-primary);
		font-weight: 500;
	}
	:global(.field-prompt em) {
		font-style: italic;
	}

	textarea.short {
		min-height: 90px;
	}
	textarea.medium {
		min-height: 120px;
	}

	.field-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
	}

	.pill-group {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.pill {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: 0.05em;
		min-height: 44px;
		padding: 10px 12px;
		border-radius: 6px;
		cursor: pointer;
		border-width: 1px;
		border-style: solid;
		transition:
			background 0.15s,
			border-color 0.15s,
			color 0.15s,
			box-shadow 0.15s,
			transform 0.1s;
		user-select: none;
		background: var(--surface-2);
		color: var(--text-secondary);
		border-color: var(--border);
		box-shadow: none;
	}

	.pill:hover {
		transform: translateY(-1px);
		border-color: var(--border-focus);
		color: var(--text-primary);
	}

	@media (prefers-reduced-motion: reduce) {
		.pill {
			transition: none;
		}
		.pill:hover {
			transform: none;
		}
	}

	.pill:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	.pill.activation:not(.active) {
		color: var(--accent-text-teal);
		border-color: rgba(45, 212, 191, 0.45);
		background: rgba(20, 184, 166, 0.1);
	}

	.pill.conversion:not(.active) {
		color: var(--accent-text-orange);
		border-color: var(--orange-border);
		background: rgba(249, 115, 22, 0.08);
	}

	.pill.retention:not(.active) {
		color: var(--accent-text-blue);
		border-color: rgba(96, 165, 250, 0.35);
		background: rgba(96, 165, 250, 0.08);
	}

	.pill.revenue:not(.active) {
		color: var(--accent-text-green);
		border-color: rgba(74, 222, 128, 0.35);
		background: rgba(74, 222, 128, 0.08);
	}

	/* Selected: tint + outer ring so state is not luminance-only */
	.pill.active {
		box-shadow: 0 0 0 2px var(--text-primary);
	}

	.pill.active.activation {
		background: var(--teal);
		color: var(--accent-text-teal);
		border-color: rgba(45, 212, 191, 0.25);
	}

	.pill.active.conversion {
		background: var(--orange-bg);
		color: var(--accent-text-orange);
		border-color: var(--orange-border);
	}

	.pill.active.retention {
		background: var(--blue-bg);
		color: var(--accent-text-blue);
		border-color: rgba(96, 165, 250, 0.3);
	}

	.pill.active.revenue {
		background: var(--green-bg);
		color: var(--accent-text-green);
		border-color: rgba(74, 222, 128, 0.3);
	}

	:global([data-theme='light']) .pill.activation:not(.active) {
		background: rgba(20, 184, 166, 0.12);
	}

	:global([data-theme='light']) .pill.conversion:not(.active) {
		background: rgba(249, 115, 22, 0.1);
	}

	:global([data-theme='light']) .pill.retention:not(.active) {
		background: rgba(96, 165, 250, 0.1);
	}

	:global([data-theme='light']) .pill.revenue:not(.active) {
		background: rgba(74, 222, 128, 0.1);
	}

	.step-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 32px;
		padding-top: 24px;
		border-top: 1px solid var(--border);
	}

	.actions-right {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.step-counter {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
	}

	.divider {
		height: 1px;
		background: var(--border);
		margin: 32px 0;
	}

	.output-preview {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 8px;
	}

	.output-mode {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
	}

	.output-num {
		font-family: var(--font-mono);
		font-size: 12px;
		width: 20px;
		height: 20px;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.output-num.one {
		background: var(--orange-bg);
		color: var(--accent-text-orange);
	}
	.output-num.two {
		background: var(--green-bg);
		color: var(--accent-text-green);
	}
	.output-num.three {
		background: rgba(167, 139, 250, 0.12);
		color: var(--accent-text-purple);
	}

	.output-title {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 2px;
	}
	.output-desc {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.4;
	}

	/* Output loader */
	.output-loader {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 32px 0;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		min-height: 148px;
		justify-content: center;
	}

	.output-loader-label {
		font-family: var(--font-mono);
		font-size: 10px;
		font-weight: 500;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.output-loader-msg {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-align: center;
	}

	/* Field validation */
	:global(input.warned),
	:global(textarea.warned) {
		border-color: var(--accent-text-orange) !important;
	}
	.field-message {
		font-size: 12px;
		color: var(--accent-text-orange);
		line-height: 1.4;
		margin-top: 2px;
	}
	.validation-disclaimer {
		font-size: 12px;
		color: var(--text-muted);
		font-style: italic;
		margin-bottom: 16px;
	}

	/* Coach placeholder */
	.coach-placeholder {
		margin-top: 32px;
		padding: 24px;
		border: 1px dashed var(--border);
		border-radius: 10px;
		background: var(--surface);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.coach-placeholder-header {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.coach-placeholder-badge {
		font-family: var(--font-mono);
		font-size: 10px;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 2px 6px;
	}
	.coach-placeholder-title {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-muted);
	}
	.coach-placeholder-body {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.65;
	}
	.coach-placeholder-sub {
		font-size: 12px;
		color: var(--text-muted);
		font-style: italic;
	}
</style>
