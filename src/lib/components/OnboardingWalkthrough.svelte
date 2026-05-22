<script lang="ts">
	import CoachResponse from '$lib/components/CoachResponse.svelte';
	import StepProgress from '$lib/components/StepProgress.svelte';
	import DotMatrix from '$lib/components/DotMatrix.svelte';
	import {
		DEMO_AUDIENCE,
		DEMO_COACHING,
		DEMO_DECISION_ID,
		DEMO_FORM,
		DEMO_OUTPUTS
	} from '$lib/demo/example-decision';
	import { seedDemoDecisionRecord } from '$lib/demo/demo-storage';
	import { inputStore } from '$lib/stores/input';
	import { outputsStore } from '$lib/stores/outputs';
	import { autoresize } from '$lib/actions/autoresize';
	import { strings } from '$lib/strings.js';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';

	type Step = 1 | 2 | 3;

	const s = strings.newDecision;
	const ob = strings.onboarding;
	const businessAreas = s.businessAreas;
	const prompts = s.prompts.ceo;
	const form = DEMO_FORM;
	const audience = DEMO_AUDIENCE;

	let currentStep = $state<Step>(1);
	let coachVisible = $state<Record<Step, boolean>>({ 1: false, 2: false, 3: false });
	let coachDone3 = $state(false);
	let loading = $state(false);
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

	function stepCounter(current: number, total: number) {
		return s.stepCounter.replace('{current}', String(current)).replace('{total}', String(total));
	}

	function coachStepLabel(step: Step): string {
		if (step === 1) return s.stepLabels.contextReview;
		if (step === 2) return s.stepLabels.analysisReview;
		return s.stepLabels.outcomesReview;
	}

	function showCoach(step: Step) {
		coachVisible[step] = true;
		setTimeout(() => {
			document
				.getElementById(`coach-${step}`)
				?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}, 50);
	}

	function goToStep(n: Step) {
		currentStep = n;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function onCoachContinue(step: Step) {
		if (step === 1) {
			coachVisible[1] = false;
			goToStep(2);
		} else if (step === 2) {
			coachVisible[2] = false;
			goToStep(3);
		} else {
			coachVisible[3] = false;
			coachDone3 = true;
		}
	}

	async function handleDemoGenerate() {
		loading = true;
		await new Promise((r) => setTimeout(r, 2400));

		seedDemoDecisionRecord();
		outputsStore.set({ ...DEMO_OUTPUTS });
		inputStore.set({
			id: DEMO_DECISION_ID,
			audience: { ...DEMO_AUDIENCE },
			form: { ...DEMO_FORM }
		});

		try {
			await fetch('/api/activity', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ event: 'onboarding_complete' })
			});
		} catch {
			/* non-blocking */
		}

		loading = false;
		goto(`/decisions/outputs?id=${encodeURIComponent(DEMO_DECISION_ID)}&demo=1`);
	}
</script>

<div class="walkthrough">
	<div class="audience-bar" role="status">
		<span class="example-badge">{ob.exampleBadge}</span>
		<span class="audience-label">{strings.audienceIndicator.label}: {audience.label}</span>
	</div>
	<p class="audience-note">{ob.walkthroughAudienceNote}</p>

	<StepProgress {currentStep} />

	{#if currentStep === 1}
		<div class="step">
			<div class="field">
				<label class="field-label" for="demo-decision">{s.fieldLabels.decision}</label>
				<p class="field-prompt">{@html prompts.decision}</p>
				<input id="demo-decision" type="text" value={form.decision} readonly />
			</div>

			<div class="field">
				<label class="field-label" for="demo-problem">{s.fieldLabels.problem}</label>
				<p class="field-prompt">{@html prompts.problem}</p>
				<textarea
					id="demo-problem"
					use:autoresize={form.problem}
					value={form.problem}
					readonly
				></textarea>
			</div>

			<fieldset class="field fieldset-reset">
				<legend class="field-label" id="demo-business-area-legend">{s.fieldLabels.businessArea}</legend>
				<p class="field-prompt" id="demo-business-area-prompt">{s.fieldLabels.businessAreaPrompt}</p>
				<div
					class="pill-group"
					role="radiogroup"
					aria-labelledby="demo-business-area-legend"
					aria-describedby="demo-business-area-prompt demo-business-area-hint"
					aria-readonly="true"
				>
					{#each businessAreas as area (area.id)}
						<button
							type="button"
							class="pill {area.class}"
							class:active={form.businessArea === area.id}
							role="radio"
							aria-checked={form.businessArea === area.id}
							disabled
							tabindex="-1"
						>
							{area.label}
						</button>
					{/each}
				</div>
				<p id="demo-business-area-hint" class="sr-only">{ob.walkthroughBusinessAreaHint}</p>
			</fieldset>

			<div class="step-actions">
				<span class="step-counter">{stepCounter(1, 3)}</span>
				{#if !coachVisible[1]}
					<button class="btn-primary" type="button" onclick={() => showCoach(1)}>
						{ob.walkthroughSeeCoaching}
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
				{/if}
			</div>

			<div id="coach-1">
				<CoachResponse
					visible={coachVisible[1]}
					stepLabel={coachStepLabel(1)}
					audienceLabel={audience.label}
					intro={DEMO_COACHING[1].intro}
					questions={DEMO_COACHING[1].questions}
					challenge={DEMO_COACHING[1].challenge}
					challengeIsPositive={DEMO_COACHING[1].challengeIsPositive}
					continueLabel={DEMO_COACHING[1].continueLabel}
					onContinue={() => onCoachContinue(1)}
				/>
			</div>
		</div>
	{/if}

	{#if currentStep === 2}
		<div class="step">
			<div class="field">
				<label class="field-label" for="demo-options">{s.fieldLabels.options}</label>
				<p class="field-prompt">{@html prompts.options}</p>
				<textarea
					id="demo-options"
					use:autoresize={form.options}
					value={form.options}
					readonly
				></textarea>
			</div>

			<div class="field">
				<label class="field-label" for="demo-data">{s.fieldLabels.data}</label>
				<p class="field-prompt">{@html prompts.data}</p>
				<textarea id="demo-data" use:autoresize={form.data} value={form.data} readonly></textarea>
			</div>

			<div class="field">
				<label class="field-label" for="demo-tradeoffs">{s.fieldLabels.tradeoffs}</label>
				<p class="field-prompt">{@html prompts.tradeoffs}</p>
				<textarea
					id="demo-tradeoffs"
					use:autoresize={form.tradeoffs}
					value={form.tradeoffs}
					readonly
				></textarea>
			</div>

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
					{#if !coachVisible[2]}
						<button class="btn-primary" type="button" onclick={() => showCoach(2)}>
							{ob.walkthroughSeeCoaching}
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
					{/if}
				</div>
			</div>

			<div id="coach-2">
				<CoachResponse
					visible={coachVisible[2]}
					stepLabel={coachStepLabel(2)}
					audienceLabel={audience.label}
					intro={DEMO_COACHING[2].intro}
					questions={DEMO_COACHING[2].questions}
					challenge={DEMO_COACHING[2].challenge}
					challengeIsPositive={DEMO_COACHING[2].challengeIsPositive}
					continueLabel={DEMO_COACHING[2].continueLabel}
					onContinue={() => onCoachContinue(2)}
				/>
			</div>
		</div>
	{/if}

	{#if currentStep === 3}
		<div class="step">
			<div class="field-row">
				<div class="field">
					<label class="field-label" for="demo-metric">{s.fieldLabels.primaryMetric}</label>
					<p class="field-prompt">{@html prompts.primaryMetric}</p>
					<input id="demo-metric" type="text" value={form.primaryMetric} readonly />
				</div>
				<div class="field">
					<label class="field-label" for="demo-guardrail">{s.fieldLabels.guardrailMetric}</label>
					<p class="field-prompt">{@html prompts.guardrailMetric}</p>
					<input id="demo-guardrail" type="text" value={form.guardrailMetric} readonly />
				</div>
			</div>

			<div class="field">
				<label class="field-label" for="demo-outcome">{s.fieldLabels.expectedOutcome}</label>
				<p class="field-prompt">{@html prompts.expectedOutcome}</p>
				<input id="demo-outcome" type="text" value={form.expectedOutcome} readonly />
			</div>

			{#if coachDone3}
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
							<p class="output-loader-note">{ob.walkthroughGeneratingNote}</p>
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

				<div class="step-actions">
					<span class="step-counter">{stepCounter(3, 3)}</span>
					<button
						class="btn-primary"
						type="button"
						onclick={handleDemoGenerate}
						disabled={loading}
					>
						<svg width="13" height="13" viewBox="0 0 16 16" fill="white" aria-hidden="true">
							<path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" />
						</svg>
						{ob.walkthroughGenerateOutputs}
					</button>
				</div>
			{/if}

			<div class="step-actions step-actions--coach">
				<button class="btn-secondary" type="button" onclick={() => goToStep(2)}>
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
					<span class="step-counter">{stepCounter(3, 3)}</span>
					{#if !coachVisible[3] && !coachDone3}
						<button class="btn-primary" type="button" onclick={() => showCoach(3)}>
							{ob.walkthroughSeeCoaching}
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
					{/if}
				</div>
			</div>

			<div id="coach-3">
				<CoachResponse
					visible={coachVisible[3]}
					stepLabel={coachStepLabel(3)}
					audienceLabel={audience.label}
					intro={DEMO_COACHING[3].intro}
					questions={DEMO_COACHING[3].questions}
					challenge={DEMO_COACHING[3].challenge}
					challengeIsPositive={DEMO_COACHING[3].challengeIsPositive}
					continueLabel={DEMO_COACHING[3].continueLabel}
					onContinue={() => onCoachContinue(3)}
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	.walkthrough {
		display: flex;
		flex-direction: column;
	}

	.audience-bar {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
		margin-bottom: 8px;
	}

	.example-badge {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 4px 10px;
	}

	.audience-label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--accent-text-orange);
	}

	.audience-note {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.65;
		margin-bottom: 32px;
	}

	.step {
		display: flex;
		flex-direction: column;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 28px;
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

	:global(.field-prompt strong) {
		color: var(--text-primary);
		font-weight: 500;
	}

	.field-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
	}

	@media (max-width: 640px) {
		.field-row {
			grid-template-columns: 1fr;
		}
	}

	input[readonly],
	textarea[readonly] {
		cursor: default;
		opacity: 0.92;
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
		cursor: not-allowed;
		border-width: 1px;
		border-style: solid;
		user-select: none;
		background: var(--surface-2);
		color: var(--text-secondary);
		border-color: var(--border);
		box-shadow: none;
	}

	.pill:disabled:not(.active) {
		opacity: 0.72;
	}

	.pill:disabled.active {
		opacity: 1;
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
		gap: 16px;
		margin-top: 8px;
		margin-bottom: 8px;
	}

	.step-actions--coach {
		margin-top: 0;
	}

	.actions-right {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-left: auto;
	}

	.step-counter {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
		letter-spacing: 0.04em;
	}

	.divider {
		height: 1px;
		background: var(--border);
		margin: 8px 0 28px;
	}

	.output-loader {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
		padding: 24px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
	}

	.output-loader-label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.output-loader-msg {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.6;
		max-width: 42ch;
	}

	.output-loader-note {
		font-size: var(--text-sm);
		color: var(--text-muted);
		line-height: 1.55;
	}

	.output-preview {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.output-mode {
		display: flex;
		gap: 14px;
		padding: 16px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
	}

	.output-num {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono);
		font-size: 11px;
		flex-shrink: 0;
	}

	.output-num.one {
		background: var(--orange-dim);
		color: var(--accent-text-orange);
		border: 1px solid var(--orange-border);
	}
	.output-num.two {
		background: var(--blue-bg);
		color: var(--accent-text-blue);
		border: 1px solid rgba(96, 165, 250, 0.3);
	}
	.output-num.three {
		background: var(--green-bg);
		color: var(--accent-text-green);
		border: 1px solid rgba(74, 222, 128, 0.3);
	}

	.output-title {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 4px;
	}

	.output-desc {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.55;
	}
</style>
