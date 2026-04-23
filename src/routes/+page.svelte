<script lang="ts">
	const SURVEY_URL = 'https://YOUR_SURVEY_LINK_HERE';
</script>

<svelte:head>
	<title>Decidr - Build the business case behind design decisions</title>
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
			Private beta
		</div>

		<h1 class="hero-title">
			Your design decisions shape business outcomes.<br />
			<span class="hero-accent">They just rarely reach the room where it matters.</span>
		</h1>

		<p class="hero-subtitle">
			Decidr helps you build the business case behind your design decisions - before leadership asks
			for one.
		</p>

		<div class="cta-group">
			<span class="cta-group-label">Private beta</span>
			<p class="cta-group-title">If that's you, request early access below.</p>
			<a href={SURVEY_URL} class="btn-primary landing-btn-primary" target="_blank" rel="noopener noreferrer">
				Request early access
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

	<section class="problem" aria-labelledby="problem-title">
		<div class="problem-inner">
			<h2 class="problem-title" id="problem-title">
				Design has always shaped business outcomes. The problem isn't the thinking.
			</h2>
			<div class="problem-body">
				<p>
					It's that most designers were never given the tools to prove it.
				</p>
				<p>
					When a design decision can't be framed in business language, it doesn't just get rejected - it
					disappears. The product stalls. Impact goes unmeasured. And talented designers stay tactical
					when they could be driving strategy.
				</p>
				<p>
					Decidr closes that gap. It helps you pressure-test your reasoning, anticipate leadership
					questions, and frame decisions in language that connects design directly to business outcomes.
				</p>
				<p class="problem-coda">Design has always been strategic. Now it can be seen that way.</p>
			</div>
		</div>
	</section>

	<section class="how" aria-labelledby="how-title">
		<p class="section-label" id="how-title">How it works</p>
		<p class="how-desc">One input. Three outputs. Built for the moments that matter.</p>

		<div class="outputs-grid">
			<div class="output-card">
				<div class="output-num one" aria-hidden="true">1</div>
				<div class="output-card-body">
					<h3 class="output-title">Prepare Decision</h3>
					<p class="output-desc">
						Before anyone else sees your decision, know where your reasoning is weak. Decidr surfaces
						gaps and flags what leadership is most likely to challenge.
					</p>
					<div class="output-tag">Before the room</div>
				</div>
			</div>

			<div class="output-card">
				<div class="output-num two" aria-hidden="true">2</div>
				<div class="output-card-body">
					<h3 class="output-title">Communicate to Leadership</h3>
					<p class="output-desc">
						Your decision, translated into exec-ready language: business impact, risk, and a clear
						recommendation for the people who need to say yes.
					</p>
					<div class="output-tag">In the room</div>
				</div>
			</div>

			<div class="output-card">
				<div class="output-num three" aria-hidden="true">3</div>
				<div class="output-card-body">
					<h3 class="output-title">Portfolio Case</h3>
					<p class="output-desc">
						The same decision, structured as a design leadership case study - context, reasoning,
						trade-offs, and what it reveals about how you think.
					</p>
					<div class="output-tag">Beyond the room</div>
				</div>
			</div>
		</div>
	</section>

	<section class="cta-section">
		<div class="cta-inner">
			<p class="cta-label">Currently in private beta</p>
			<h2 class="cta-title">Design deserves a seat at the table. Decidr helps you claim it.</h2>
			<p class="cta-desc">
				We're opening access to designers who report to non-design leadership and are ready to turn
				strong thinking into real business influence.
			</p>
			<a
				href={SURVEY_URL}
				class="landing-btn-primary-center"
				target="_blank"
				rel="noopener noreferrer"
			>
				Request early access
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
		color: var(--orange);
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

	.cta-group-label {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.cta-group-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--text-primary);
		letter-spacing: -0.02em;
		line-height: 1.4;
	}

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

	@media (max-width: 640px) {
		.problem-inner {
			grid-template-columns: 1fr;
			gap: 32px;
		}
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
		font-size: 15px;
		font-weight: 600;
		color: var(--text-primary) !important;
		letter-spacing: -0.02em;
		margin-top: 8px;
	}

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

	@media (max-width: 640px) {
		.outputs-grid {
			grid-template-columns: 1fr;
		}
	}

	.output-card {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 22px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
		transition: border-color 0.15s;
	}

	.output-card:hover {
		border-color: var(--border-focus);
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
		color: var(--orange);
	}

	.output-num.two {
		background: var(--green-bg);
		color: var(--green-text);
	}

	.output-num.three {
		background: rgb(167 139 250 / 12%);
		color: #a78bfa;
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

	.landing-btn-primary {
		padding: 14px 28px;
		font-size: 14px;
		letter-spacing: -0.01em;
		border-radius: 9px;
		text-decoration: none;
		width: 100%;
		justify-content: center;
	}

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

	.landing-btn-primary-center {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 14px 28px;
		background: var(--orange);
		color: white;
		font-family: var(--font-sans);
		font-size: 14px;
		font-weight: 600;
		border-radius: 9px;
		text-decoration: none;
		border: none;
		cursor: pointer;
		transition: background 0.15s, transform 0.1s;
	}

	.landing-btn-primary-center:hover {
		background: #ea6d0e;
		transform: translateY(-1px);
	}

	.landing-btn-primary-center:active {
		transform: translateY(0);
	}
</style>
