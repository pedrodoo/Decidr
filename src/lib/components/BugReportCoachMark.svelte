<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { strings } from '$lib/strings.js';

	const STORAGE_KEY = 'decidr:bug-hint-seen';
	const s = strings.bugReport;

	let { visible = false, onDismiss }: { visible?: boolean; onDismiss?: () => void } = $props();

	let show = $state(false);
	let top = $state(72);
	let right = $state(24);

	onMount(() => {
		if (!visible || !browser) return;
		try {
			if (localStorage.getItem(STORAGE_KEY) === '1') return;
		} catch {
			return;
		}

		const anchor = document.querySelector('[data-bug-report-btn]');
		if (anchor) {
			const rect = anchor.getBoundingClientRect();
			top = rect.bottom + 12;
			right = Math.max(16, window.innerWidth - rect.right);
		}

		show = true;
	});

	function dismiss() {
		show = false;
		try {
			localStorage.setItem(STORAGE_KEY, '1');
		} catch {
			/* ignore */
		}
		onDismiss?.();
	}
</script>

{#if show}
	<div
		class="coach-mark"
		role="status"
		style="top: {top}px; right: {right}px;"
		aria-live="polite"
	>
		<div class="coach-mark-arrow" aria-hidden="true"></div>
		<p class="coach-mark-title">{s.coachMarkTitle}</p>
		<p class="coach-mark-body">{s.coachMarkBody}</p>
		<button class="btn-secondary coach-mark-dismiss" type="button" onclick={dismiss}>
			{s.coachMarkDismiss}
		</button>
	</div>
{/if}

<style>
	.coach-mark {
		position: fixed;
		z-index: 200;
		max-width: min(320px, calc(100vw - 32px));
		padding: 14px 16px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
		animation: coachIn 0.25s ease;
	}

	@keyframes coachIn {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.coach-mark {
			animation: none;
		}
	}

	.coach-mark-arrow {
		position: absolute;
		top: -6px;
		right: 18px;
		width: 12px;
		height: 12px;
		background: var(--surface);
		border-left: 1px solid var(--border);
		border-top: 1px solid var(--border);
		transform: rotate(45deg);
	}

	.coach-mark-title {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--accent-text-orange);
		margin-bottom: 6px;
	}

	.coach-mark-body {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.55;
		margin-bottom: 12px;
	}

	.coach-mark-dismiss {
		width: 100%;
		justify-content: center;
	}
</style>
