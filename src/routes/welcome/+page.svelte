<svelte:head>
	<title>Welcome</title>
</svelte:head>

<main id="main" class="page">
	<h1 class="sr-only">Welcome</h1>

	<section class="card">
		<div class="eyebrow">Decidr</div>
		<h2 class="title">For teams who take decision conversations seriously.</h2>
		<p class="subtitle">
			Decidr helps product and design teams structure their discourse before it reaches the business table.
			It was built to turn scattered opinions into clear, shared reasoning so cross-functional decisions move
			with more trust and less noise.
		</p>

		<div class="ctaRow">
			<a class="btn-primary cta" href="/decisions/new">
				Start your first decision
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
		max-width: 760px;
		margin: 0 auto;
		padding: 48px 24px 100px;
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

	.card {
		border: 1px solid var(--border);
		background: var(--surface);
		border-radius: 10px;
		padding: 28px;
	}

	.eyebrow {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--orange);
		margin-bottom: 12px;
	}

	.title {
		font-size: var(--text-xxl);
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--text-primary);
		margin-bottom: 12px;
	}

	.subtitle {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.65;
		margin-bottom: 20px;
		max-width: 620px;
	}

	.ctaRow {
		display: flex;
		align-items: center;
	}

	.cta {
		text-decoration: none;
	}
</style>

