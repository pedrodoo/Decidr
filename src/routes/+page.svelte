<script lang="ts">
	import { onMount } from 'svelte';
	import { strings } from '$lib/strings.js';

	const s = strings.landing;
	const SURVEY_URL = s.surveyUrl;

	onMount(() => {
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReduced) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						e.target.classList.add('is-visible');
						observer.unobserve(e.target);
					}
				});
			},
			{ threshold: 0.08 }
		);

		document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	});
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

<main class="page">
	<section class="hero">
		<div class="beta-badge">
			<span class="beta-dot" aria-hidden="true"></span>
			{s.betaBadge}
		</div>

		<h1 class="hero-title">
			{s.heroTitle}<br />
			<span class="hero-accent">{s.heroAccent}</span>
		</h1>

		<p class="hero-subtitle">{s.heroSubtitle}</p>

		<div class="cta-group">
			<p class="cta-group-title">{s.earlyAccessPrompt}</p>
			<a
				href={SURVEY_URL}
				class="landing-btn landing-btn--full"
				target="_blank"
				rel="noopener noreferrer"
			>
				{s.requestEarlyAccess}
				<svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
					<path
						d="M5 3l4 4-4 4"
						stroke="white"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</a>
		</div>
	</section>

	<section class="problem reveal" aria-labelledby="problem-title">
		<div class="problem-inner">
			<h2 class="problem-title" id="problem-title">
				{@html s.problem.title}
			</h2>
			<div class="problem-body">
				<p>{s.problem.p1}</p>
				<p>{s.problem.p2}</p>
				<p>{s.problem.p3}</p>
				<p class="problem-coda">{@html s.problem.coda}</p>
			</div>
		</div>
	</section>

	<section class="how" aria-labelledby="how-title">
		<p class="section-label" id="how-title">{s.how.label}</p>
		<p class="how-desc">{@html s.how.desc}</p>

		<div class="outputs-grid">
			<div class="output-card accent-orange reveal">
				<div class="output-card-top">
					<div class="output-num one" aria-hidden="true">1</div>
					<div class="output-tag">{s.how.cards.prepare.tag}</div>
				</div>
				<div class="output-card-body">
					<h3 class="output-title">{s.how.cards.prepare.title}</h3>
					<p class="output-desc">{s.how.cards.prepare.desc}</p>
				</div>
			</div>

			<div class="output-card accent-green reveal">
				<div class="output-card-top">
					<div class="output-num two" aria-hidden="true">2</div>
					<div class="output-tag">{s.how.cards.communicate.tag}</div>
				</div>
				<div class="output-card-body">
					<h3 class="output-title">{s.how.cards.communicate.title}</h3>
					<p class="output-desc">{s.how.cards.communicate.desc}</p>
				</div>
			</div>

			<div class="output-card accent-purple reveal">
				<div class="output-card-top">
					<div class="output-num three" aria-hidden="true">3</div>
					<div class="output-tag">{s.how.cards.portfolio.tag}</div>
				</div>
				<div class="output-card-body">
					<h3 class="output-title">{s.how.cards.portfolio.title}</h3>
					<p class="output-desc">{s.how.cards.portfolio.desc}</p>
				</div>
			</div>
		</div>
	</section>

	<section class="cta-section reveal">
		<div class="cta-inner">
			<p class="cta-label">{s.cta.label}</p>
			<h2 class="cta-title">{s.cta.title}</h2>
			<p class="cta-desc">{s.cta.desc}</p>
			<a href={SURVEY_URL} class="landing-btn" target="_blank" rel="noopener noreferrer">
				{s.requestEarlyAccess}
				<svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
					<path
						d="M5 3l4 4-4 4"
						stroke="white"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</a>
		</div>
	</section>
</main>

<style>
	.page {
		max-width: 860px;
		margin: 0 auto;
		padding: 0 24px 100px;
	}

	/* ── Scroll reveal ──────────────────────────────────────────────── */
	.reveal {
		opacity: 0;
		transform: translateY(16px);
		transition:
			opacity 0.5s ease,
			transform 0.5s ease;
	}

	/* :global needed — class is added dynamically by IntersectionObserver */
	:global(.reveal.is-visible) {
		opacity: 1;
		transform: translateY(0);
	}

	/* Stagger output cards */
	:global(.outputs-grid .reveal:nth-child(2)) {
		transition-delay: 0.12s;
	}
	:global(.outputs-grid .reveal:nth-child(3)) {
		transition-delay: 0.24s;
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}

	/* ── Hero ───────────────────────────────────────────────────────── */
	.hero {
		padding: 80px 0 88px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 24px;
		border-bottom: 1px solid var(--border);
	}

	.beta-badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 5px 12px;
		border: 1px solid var(--border);
		border-radius: 20px;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-secondary);
		background: var(--surface);
	}

	.beta-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--orange);
		animation: pulse 2s ease-in-out infinite;
		flex-shrink: 0;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.35;
		}
	}

	.hero-title {
		font-size: clamp(30px, 5vw, 48px);
		font-weight: 700;
		letter-spacing: -0.04em;
		line-height: 1.1;
		color: var(--text-primary);
		max-width: 640px;
	}

	.hero-accent {
		color: var(--accent-text-orange);
	}

	.hero-subtitle {
		font-size: 16px;
		color: var(--text-secondary);
		line-height: 1.7;
		max-width: 500px;
	}

	.cta-group {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
		margin-top: 12px;
		padding: 28px 32px;
		border: 1px solid var(--surface-2);
		border-radius: 14px;
		background: var(--surface);
		width: 100%;
		max-width: 440px;
	}

	.cta-group-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--text-primary);
		letter-spacing: -0.02em;
		line-height: 1.4;
	}

	/* ── Problem ────────────────────────────────────────────────────── */
	.problem {
		padding: 80px 0;
		border-bottom: 1px solid var(--border);
	}

	.problem-inner {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 64px;
		align-items: start;
	}

	.problem-title {
		font-size: 22px;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--text-primary);
		line-height: 1.3;
		position: sticky;
		top: 72px;
	}

	.problem-body {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.problem-body p {
		font-size: 15px;
		color: var(--text-secondary);
		line-height: 1.75;
	}

	.problem-coda {
		font-size: 15px !important;
		font-weight: 600;
		color: var(--text-primary) !important;
		letter-spacing: -0.02em;
		margin-top: 8px;
		padding-left: 14px;
		border-left: 2px solid var(--orange);
		line-height: 1.5;
	}

	@media (max-width: 768px) {
		.problem-inner {
			grid-template-columns: 1fr;
			gap: 40px;
		}

		.problem-title {
			position: static;
		}
	}

	@media (max-width: 640px) {
		.problem-inner {
			gap: 32px;
		}
	}

	/* ── How it works ───────────────────────────────────────────────── */
	.how {
		padding: 80px 0;
		border-bottom: 1px solid var(--border);
	}

	.section-label {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin-bottom: 12px;
	}

	.how-desc {
		font-size: 20px;
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--text-primary);
		line-height: 1.3;
		max-width: 460px;
		margin-bottom: 44px;
	}

	.outputs-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}

	@media (max-width: 768px) {
		.outputs-grid {
			grid-template-columns: 1fr;
		}
	}

	.output-card-top {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.output-card {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 22px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
		cursor: pointer;
		transition:
			border-color 0.15s,
			transform 0.15s;
	}

	.output-card:hover {
		border-color: var(--border-focus);
		transform: translateY(-2px);
	}

	.output-card.accent-orange {
		border-top: 2px solid var(--orange);
	}
	.output-card.accent-green {
		border-top: 2px solid var(--accent-text-green);
	}
	.output-card.accent-purple {
		border-top: 2px solid var(--accent-text-purple);
	}

	.output-num {
		font-family: var(--font-mono);
		font-size: 11px;
		width: 28px;
		height: 28px;
		border-radius: 7px;
		display: flex;
		align-items: center;
		justify-content: center;
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
		background: rgb(167 139 250 / 12%);
		color: var(--accent-text-purple);
	}

	.output-card-body {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.output-title {
		font-size: 14px;
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--text-primary);
		line-height: 1.3;
	}

	.output-desc {
		font-size: 12px;
		color: var(--text-secondary);
		line-height: 1.65;
		flex: 1;
	}

	.output-tag {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin-top: 4px;
	}

	/* ── CTA section ────────────────────────────────────────────────── */
	.cta-section {
		padding: 80px 0 0;
		display: flex;
		justify-content: center;
	}

	.cta-inner {
		max-width: 480px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.cta-label {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.cta-title {
		font-size: 28px;
		font-weight: 700;
		letter-spacing: -0.04em;
		color: var(--text-primary);
		line-height: 1.2;
	}

	.cta-desc {
		font-size: 14px;
		color: var(--text-secondary);
		line-height: 1.7;
	}

	/* ── Shared CTA button ──────────────────────────────────────────── */
	.landing-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 14px 28px;
		background: var(--orange);
		color: white;
		font-family: var(--font-sans);
		font-size: 14px;
		font-weight: 600;
		letter-spacing: -0.01em;
		border-radius: 9px;
		text-decoration: none;
		border: none;
		cursor: pointer;
		transition:
			background 0.15s,
			transform 0.1s;
	}

	.landing-btn--full {
		width: 100%;
	}

	.landing-btn:hover {
		background: var(--orange-hover);
		transform: translateY(-1px);
	}

	.landing-btn:active {
		transform: translateY(0);
	}

	.landing-btn:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 3px;
	}

	/* ── Mobile ─────────────────────────────────────────────────────── */
	@media (max-width: 480px) {
		.page {
			padding: 0 16px 80px;
		}

		.hero {
			padding: 56px 0 64px;
		}

		.cta-group {
			padding: 20px;
			max-width: 100%;
		}
	}
</style>
