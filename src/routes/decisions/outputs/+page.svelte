<script lang="ts">
	import { outputsStore, type DecisionOutputs } from '$lib/stores/outputs';
	import { inputStore } from '$lib/stores/input';
	import {
		getDecision,
		getLatestIteration,
		updateLatestIterationOutputs
	} from '$lib/decisions/storage';
	import { DEMO_DECISION_ID } from '$lib/demo/example-decision';
	import { seedDemoDecisionRecord } from '$lib/demo/demo-storage';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { renderMarkdown } from '$lib/sanitize-markdown';
	import { get } from 'svelte/store';
	import { strings } from '$lib/strings.js';
	import BugReportCoachMark from '$lib/components/BugReportCoachMark.svelte';
	import { highlightBugReportButton } from '$lib/stores/bug-hint';

	let { data } = $props();

	let outputs = $state<DecisionOutputs>({});
	let loading = $state<string | null>(null);
	let generateError = $state<string | null>(null);
	let currentId = $state<string | null>(null);
	let iterationCount = $state(0);
	let iterationIndex = $state(0);
	let lastGeneratedAt = $state<string | null>(null);
	const s = strings.decisionOutputs;
	const demo = strings.demoOutputs;
	const isDemo = $derived(data.isDemo || page.url.searchParams.get('demo') === '1');
	const tallyUrl = strings.landing.surveyUrl;
	let coachMarkVisible = $state(false);

	function refineHref(): string {
		if (isDemo) return '/welcome?skip=1';
		return currentId ? `/decisions/new?id=${encodeURIComponent(currentId)}` : '/decisions/new';
	}

	function backHref(): string {
		if (isDemo) return '/onboarding';
		return refineHref();
	}

	function formatTime(iso: string | null): string {
		if (!iso) return '';
		const date = new Date(iso);
		return new Intl.DateTimeFormat('pt-PT', {
			day: '2-digit',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	onMount(() => {
		const idParam = page.url.searchParams.get('id');
		const demoMode = data.isDemo || page.url.searchParams.get('demo') === '1';

		if (!idParam) {
			goto(demoMode ? '/welcome' : '/decisions');
			return;
		}

		if (demoMode && idParam === DEMO_DECISION_ID) {
			let record = getDecision(idParam);
			if (!record) {
				record = seedDemoDecisionRecord();
			}
			loadFromRecord(record);
			coachMarkVisible = true;
			highlightBugReportButton.set(true);
			return () => highlightBugReportButton.set(false);
		}

		const record = getDecision(idParam);
		if (!record) {
			goto(demoMode ? '/welcome' : '/decisions');
			return;
		}
		loadFromRecord(record);
	});

	async function markOnboardingComplete() {
		try {
			await fetch('/api/activity', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ event: 'onboarding_complete' })
			});
		} catch {
			/* non-blocking */
		}
	}

	async function startOwnDecision() {
		await markOnboardingComplete();
		goto('/welcome?skip=1');
	}

	function loadFromRecord(record: NonNullable<ReturnType<typeof getDecision>>) {
		const latest = getLatestIteration(record);
		if (!latest) {
			goto(`/decisions/new?id=${encodeURIComponent(record.id)}`);
			return;
		}

		currentId = record.id;
		iterationCount = record.iterations.length;
		iterationIndex = record.iterations.length;
		lastGeneratedAt = latest.generatedAt;
		outputs = { ...latest.outputs };
		outputsStore.set({ ...latest.outputs });
		inputStore.set({
			id: record.id,
			audience: latest.inputSnapshot.audience,
			form: latest.inputSnapshot.form
		});
	}

	function parseConfidence(text: string): { rating: string; reason: string } {
		const lines = text.trim().split('\n');
		const ratingLine = lines.find((l) => l.startsWith('Rating:')) ?? '';
		const reasonIdx = lines.findIndex((l) => l.startsWith('Reason:'));
		let reason = '';
		if (reasonIdx !== -1) {
			const firstPart = lines[reasonIdx].replace('Reason:', '').trim();
			const rest = lines
				.slice(reasonIdx + 1)
				.filter((l) => l.trim())
				.join(' ')
				.trim();
			reason = [firstPart, rest].filter(Boolean).join(' ');
		}
		return {
			rating: ratingLine.replace('Rating:', '').trim(),
			reason
		};
	}

	function confidenceVariant(rating: string): 'not-ready' | 'needs-work' | 'ready' {
		if (rating === 'Not Ready') return 'not-ready';
		if (rating === 'Ready to Present') return 'ready';
		return 'needs-work';
	}

	async function generatePrepare() {
		loading = 'prepare';
		generateError = null;

		const stored = get(inputStore);
		if (!stored) {
			goto(refineHref());
			return;
		}

		try {
			const response = await fetch('/api/decisions/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					mode: 'prepare',
					input: {
						audience: stored.audience.id,
						audienceLabel: stored.audience.label,
						...stored.form
					}
				})
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.message ?? strings.common.somethingWentWrong);
			}

			const result = await response.json();
			outputs = { ...outputs, prepare: result.prepare };
			outputsStore.update((o) => ({ ...o, prepare: result.prepare }));
			if (currentId) {
				updateLatestIterationOutputs(currentId, { prepare: result.prepare });
			}
		} catch (e) {
			generateError = e instanceof Error ? e.message : strings.common.unknownError;
		} finally {
			loading = null;
		}
	}

	async function generateMode(mode: 'communicate' | 'portfolio') {
		loading = mode;
		generateError = null;

		const stored = get(inputStore);
		if (!stored) {
			goto(refineHref());
			return;
		}

		try {
			const response = await fetch('/api/decisions/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					mode,
					prepareReview: outputs.prepare?.trim() || undefined,
					input: {
						audience: stored.audience.id,
						audienceLabel: stored.audience.label,
						...stored.form
					}
				})
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.message ?? strings.common.somethingWentWrong);
			}

			const result = await response.json();
			outputs = { ...outputs, [mode]: result[mode] };
			outputsStore.update((o) => ({ ...o, [mode]: result[mode] }));
			if (currentId) {
				updateLatestIterationOutputs(currentId, { [mode]: result[mode] });
			}
		} catch (e) {
			generateError = e instanceof Error ? e.message : strings.common.unknownError;
		} finally {
			loading = null;
		}
	}
</script>

<div class="page">
	{#if isDemo}
		<BugReportCoachMark
			visible={coachMarkVisible}
			onDismiss={() => highlightBugReportButton.set(false)}
		/>
		<div class="demo-banner" role="status">
			<span class="demo-badge">{demo.exampleBadge}</span>
			<div class="demo-banner-text">
				<p class="demo-banner-title">{demo.bannerTitle}</p>
				<p class="demo-banner-body">{demo.bannerBody}</p>
				<p class="demo-banner-bug">{demo.bugHint}</p>
			</div>
			<div class="demo-banner-actions">
				<button class="btn-primary" type="button" onclick={startOwnDecision}>
					{demo.startOwnDecision}
				</button>
				<a class="btn-ghost" href={backHref()}>{demo.backToTour}</a>
				<a
					class="btn-ghost-inline"
					href={tallyUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					{demo.tallyFeedback}
				</a>
			</div>
		</div>
	{/if}

	<div class="page-header">
		<a class="back-btn" href={backHref()} aria-label={s.backToInputsAria}>
			<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
				<path
					d="M9 11L5 7l4-4"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</a>
		<div>
			<h1 class="page-title">{s.pageTitle}</h1>
			<p class="page-subtitle">
				{s.iterationMeta
					.replace('{current}', String(iterationIndex))
					.replace('{total}', String(iterationCount))}
				{#if lastGeneratedAt}
					· {s.generatedAt.replace('{time}', formatTime(lastGeneratedAt))}{/if}
			</p>
		</div>
	</div>

	<!-- CONFIDENCE GATE — always visible once confidence is set -->
	{#if outputs.confidence}
		{@const parsed = parseConfidence(outputs.confidence)}
		{@const variant = confidenceVariant(parsed.rating)}
		<div class="gate gate-{variant}">
			<div class="gate-header">
				<span class="gate-label">{s.gateLabel}</span>
				<span class="gate-rating gate-rating-{variant}">{parsed.rating}</span>
			</div>
			{#if parsed.reason}
				<p class="gate-reason">{parsed.reason}</p>
			{/if}
			{#if !outputs.prepare && !isDemo}
				{@const gv = confidenceVariant(parseConfidence(outputs.confidence ?? '').rating)}
				<div class="gate-actions">
					{#if gv === 'ready'}
						<button
							class="btn-primary"
							type="button"
							onclick={generatePrepare}
							disabled={loading === 'prepare'}
						>
							{loading === 'prepare' ? strings.common.generating : s.actions.generateFullReview}
							{#if loading !== 'prepare'}
								<svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
									<path
										d="M5 3l4 4-4 4"
										stroke="white"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							{/if}
						</button>
						<a class="btn-ghost" href={refineHref()}>{s.actions.backToInputs}</a>
					{:else}
						<a class="btn-primary" href={refineHref()}>{s.actions.backToInputs}</a>
						<button
							class="btn-ghost"
							type="button"
							onclick={generatePrepare}
							disabled={loading === 'prepare'}
						>
							{loading === 'prepare'
								? strings.common.generating
								: s.actions.generateFullReviewAnyway}
						</button>
					{/if}
				</div>
				{#if generateError}
					<p class="generate-error">{generateError}</p>
				{/if}
			{/if}
		</div>
	{/if}

	<!-- PREPARE — shown after full review is generated -->
	{#if outputs.prepare}
		{@const parsed = parseConfidence(outputs.confidence ?? '')}
		{@const variant = confidenceVariant(parsed.rating)}
		<div class="output-block">
			<div class="output-header">
				<span class="output-num one">1</span>
				<div>
					<div class="output-title">{s.prepare.title}</div>
					<div class="output-desc">{s.prepare.desc}</div>
				</div>
			</div>
			<div class="output-body prose">
				{@html renderMarkdown(outputs.prepare)}
			</div>
			{#if !isDemo && (variant === 'not-ready' || variant === 'needs-work')}
				<div class="refine-footer">
					<p class="refine-hint">{s.refineHint}</p>
					<a class="btn-ghost-inline" href={refineHref()}>{s.actions.refineInputs}</a>
				</div>
			{/if}
		</div>
	{/if}

	{#if isDemo && outputs.prepare && (outputs.communicate || outputs.portfolio)}
		<p class="demo-preview-divider">{demo.previewDivider}</p>
	{/if}

	<!-- NEXT STEP CARDS — shown after prepare, until communicate/portfolio are generated -->
	{#if !isDemo && outputs.prepare && (!outputs.communicate || !outputs.portfolio)}
		<div class="next-section">
			<p class="next-label">{s.nextLabel}</p>
			<div class="next-cards">
				{#if !outputs.communicate}
					<button
						class="next-card"
						type="button"
						onclick={() => generateMode('communicate')}
						disabled={loading === 'communicate'}
					>
						<div class="next-card-num two">2</div>
						<div class="next-card-body">
							<div class="next-card-title">
								{loading === 'communicate' ? strings.common.generating : s.communicate.title}
							</div>
							<div class="next-card-desc">
								{s.communicate.cardDesc}
							</div>
						</div>
						<svg class="next-card-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none">
							<path
								d="M5 3l4 4-4 4"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				{/if}

				{#if !outputs.portfolio}
					<button
						class="next-card"
						type="button"
						onclick={() => generateMode('portfolio')}
						disabled={loading === 'portfolio'}
					>
						<div class="next-card-num three">3</div>
						<div class="next-card-body">
							<div class="next-card-title">
								{loading === 'portfolio' ? strings.common.generating : s.portfolio.title}
							</div>
							<div class="next-card-desc">
								{s.portfolio.cardDesc}
							</div>
						</div>
						<svg class="next-card-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none">
							<path
								d="M5 3l4 4-4 4"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				{/if}
			</div>
			{#if generateError}
				<p class="generate-error">{generateError}</p>
			{/if}
		</div>
	{/if}

	<!-- COMMUNICATE — shown when generated -->
	{#if outputs.communicate}
		<div class="output-block">
			<div class="output-header">
				<span class="output-num two">2</span>
				<div>
					<div class="output-title">{s.communicate.title}</div>
					<div class="output-desc">{s.communicate.desc}</div>
					{#if isDemo}
						<p class="full-access-note">{demo.fullAccessNote}</p>
					{/if}
				</div>
			</div>
			<div class="output-body prose">
				{@html renderMarkdown(outputs.communicate)}
			</div>
		</div>
	{/if}

	<!-- PORTFOLIO — shown when generated -->
	{#if outputs.portfolio}
		<div class="output-block">
			<div class="output-header">
				<span class="output-num three">3</span>
				<div>
					<div class="output-title">{s.portfolio.title}</div>
					<div class="output-desc">{s.portfolio.desc}</div>
					{#if isDemo}
						<p class="full-access-note">{demo.fullAccessNote}</p>
					{/if}
				</div>
			</div>
			<div class="output-body prose">
				{@html renderMarkdown(outputs.portfolio)}
			</div>
		</div>
	{/if}
</div>

<style>
	.page {
		max-width: 760px;
		margin: 0 auto;
		padding: 48px 24px 100px;
	}

	.demo-banner {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 20px;
		margin-bottom: 32px;
		border: 1px solid var(--orange-border);
		border-radius: 10px;
		background: var(--orange-dim);
	}

	.demo-badge {
		align-self: flex-start;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--accent-text-orange);
		border: 1px solid var(--orange-border);
		border-radius: 999px;
		padding: 4px 10px;
	}

	.demo-banner-title {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 6px;
	}

	.demo-banner-body {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.demo-banner-bug {
		font-size: var(--text-sm);
		color: var(--text-muted);
		line-height: 1.55;
		margin-top: 10px;
	}

	.demo-preview-divider {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: 0.04em;
		color: var(--text-muted);
		margin: 8px 0 24px;
		padding-top: 8px;
		border-top: 1px solid var(--border);
	}

	.full-access-note {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin-top: 8px;
	}

	.demo-banner-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		align-items: center;
	}

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
		transition:
			border-color 0.15s,
			color 0.15s;
		text-decoration: none;
		flex-shrink: 0;
	}

	.back-btn:hover {
		border-color: var(--border-focus);
		color: var(--text-primary);
	}

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

	/* CONFIDENCE GATE */
	.gate {
		border: 1px solid;
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 32px;
	}

	.gate-not-ready {
		border-color: rgba(248, 113, 113, 0.3);
		background: rgba(248, 113, 113, 0.05);
	}
	.gate-needs-work {
		border-color: rgba(245, 158, 11, 0.3);
		background: rgba(245, 158, 11, 0.05);
	}
	.gate-ready {
		border-color: rgba(52, 211, 153, 0.3);
		background: rgba(52, 211, 153, 0.05);
	}

	.gate-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 10px;
	}

	.gate-label {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.gate-rating {
		font-size: 13px;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.gate-rating-not-ready {
		color: var(--semantic-danger);
	}
	.gate-rating-needs-work {
		color: var(--semantic-warning);
	}
	.gate-rating-ready {
		color: var(--semantic-success);
	}

	.gate-reason {
		font-size: 14px;
		color: var(--text-secondary);
		line-height: 1.65;
		margin-bottom: 24px;
	}

	.gate-actions {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 20px;
		background: var(--orange);
		color: white;
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 600;
		border-radius: 8px;
		border: none;
		cursor: pointer;
		transition:
			background 0.15s,
			transform 0.1s;
		letter-spacing: -0.01em;
	}

	.btn-primary:hover:not(:disabled) {
		background: #ea6d0e;
		transform: translateY(-1px);
	}
	.btn-primary:active:not(:disabled) {
		transform: translateY(0);
	}
	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-ghost {
		font-size: 13px;
		color: var(--text-secondary);
		text-decoration: none;
		padding: 10px 4px;
		transition: color 0.15s;
		background: none;
		border: none;
		cursor: pointer;
		font-family: var(--font-sans);
	}

	.btn-ghost:hover {
		color: var(--text-primary);
	}
	.btn-ghost:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* OUTPUT BLOCKS */
	.output-block {
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
		overflow: hidden;
		margin-bottom: 24px;
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
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 2px;
	}
	.output-desc {
		font-size: 12px;
		color: var(--text-secondary);
	}
	.output-body {
		padding: 24px;
	}

	.refine-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 24px;
		border-top: 1px solid var(--border);
		background: var(--surface);
	}

	.refine-hint {
		font-size: 12px;
		color: var(--text-muted);
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

	/* NEXT STEP CARDS */
	.next-section {
		margin-bottom: 24px;
	}

	.next-label {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin-bottom: 12px;
	}

	.next-cards {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.next-card {
		display: flex;
		align-items: center;
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

	.next-card:hover:not(:disabled) {
		border-color: var(--border-focus);
		background: var(--surface-2);
	}

	.next-card:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.next-card-num {
		font-family: var(--font-mono);
		font-size: 11px;
		width: 28px;
		height: 28px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.next-card-num.two {
		background: var(--green-bg);
		color: var(--accent-text-green);
	}
	.next-card-num.three {
		background: rgba(167, 139, 250, 0.12);
		color: var(--accent-text-purple);
	}

	.next-card-body {
		flex: 1;
	}

	.next-card-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
		letter-spacing: -0.02em;
		margin-bottom: 4px;
	}

	.next-card-desc {
		font-size: 12px;
		color: var(--text-secondary);
		line-height: 1.55;
	}

	.next-card-arrow {
		color: var(--text-muted);
		flex-shrink: 0;
	}

	.generate-error {
		font-size: 13px;
		color: var(--semantic-danger);
		margin-top: 12px;
	}

	/* PROSE */
	.prose :global(h2) {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
		font-family: var(--font-mono);
		margin-bottom: 10px;
		margin-top: 28px;
	}

	.prose :global(h2:first-child) {
		margin-top: 0;
	}

	.prose :global(p) {
		font-size: 14px;
		color: var(--text-primary);
		line-height: 1.75;
		margin-bottom: 14px;
	}

	.prose :global(ul),
	.prose :global(ol) {
		padding-left: 20px;
		margin-bottom: 14px;
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
