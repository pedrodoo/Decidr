<script lang="ts">
	interface Props {
		dotSize?: number;
		gap?: number;
	}

	let { dotSize = 6, gap = 5 } = $props();

	const COLS = 14;
	const CELL = dotSize + gap;
	const SHOULDER_ROW = 7;
	const SHOULDER_COL = 1;

	// 0 = bg (barely visible), 1 = body, 2 = paw (animated wave)
	const MAP = [
		// R0 — paw fingertips
		0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		// R1 — paw arm, ear tips
		0, 2, 2, 2, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0,
		// R2 — paw, ears forming
		0, 2, 2, 2, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0,
		// R3 — paw wrist, head
		0, 2, 2, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
		// R4 — paw arm, head
		0, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
		// R5 — eyes at col 5 and col 10
		0, 2, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0,
		// R6 — paw shoulder, face
		0, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
		// R7 — nose gap at col 7
		0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0,
		// R8 — neck
		0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0,
		// R9 — body top
		0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
		// R10
		0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
		// R11
		0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
		// R12 — body widens
		0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		// R13
		0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		// R14
		0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		// R15 — belly / legs
		0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
		// R16
		0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
		// R17 — two front paws
		0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0,
		// R18
		0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0,
		// R19
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	];

	const dots = MAP.map((type, i) => {
		const row = Math.floor(i / COLS);
		const col = i % COLS;
		const originX = (SHOULDER_COL - col) * CELL + dotSize / 2;
		const originY = (SHOULDER_ROW - row) * CELL + dotSize / 2;
		return { type, originX, originY };
	});
</script>

<div
	class="cat"
	aria-hidden="true"
	style="--dot-size:{dotSize}px; --gap:{gap}px; --cols:{COLS}"
>
	{#each dots as dot}
		<span
			class="dot"
			class:body={dot.type === 1}
			class:paw={dot.type === 2}
			style={dot.type === 2
				? `transform-origin: ${dot.originX}px ${dot.originY}px`
				: undefined}
		/>
	{/each}
</div>

<style>
	.cat {
		display: grid;
		grid-template-columns: repeat(var(--cols), var(--dot-size));
		gap: var(--gap);
	}

	.dot {
		width: var(--dot-size);
		height: var(--dot-size);
		border-radius: 50%;
		background: white;
		opacity: 0.04;
	}

	.body {
		opacity: 0.65;
	}

	.paw {
		opacity: 0.65;
		animation: paw-wave 2.4s ease-in-out infinite;
	}

	@keyframes paw-wave {
		0%,
		100% {
			transform: rotate(-5deg);
		}
		50% {
			transform: rotate(15deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.paw {
			animation: none;
			transform: none;
		}
	}
</style>
