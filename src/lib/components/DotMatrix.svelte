<script lang="ts">
	interface Props {
		dotSize?: number;
		color?: string;
		gap?: number;
	}

	let { dotSize = 7, color = 'currentColor', gap = 6 } = $props();

	const GRID = 5;
	const CENTER = 2;

	const dots = Array.from({ length: GRID * GRID }, (_, i) => {
		const row = Math.floor(i / GRID);
		const col = i % GRID;
		const dist = Math.hypot(col - CENTER, row - CENTER);
		const staticOpacity = Math.max(0.08, 0.88 - dist * 0.28);
		return { dist: dist.toFixed(3), staticOpacity: staticOpacity.toFixed(3) };
	});
</script>

<div
	class="dmx-grid"
	style="--dot-size:{dotSize}px; --dot-color:{color}; --gap:{gap}px"
	aria-hidden="true"
>
	{#each dots as dot}
		<span class="dmx-dot" style="--dist:{dot.dist}; --static-opacity:{dot.staticOpacity}"></span>
	{/each}
</div>

<style>
	.dmx-grid {
		display: grid;
		grid-template-columns: repeat(5, var(--dot-size));
		gap: var(--gap);
	}

	.dmx-dot {
		width: var(--dot-size);
		height: var(--dot-size);
		border-radius: 50%;
		background: var(--dot-color);
		opacity: 0.08;
		animation: dmx-ripple 1.8s ease-in-out infinite;
		animation-delay: calc(var(--dist) * -220ms);
	}

	@keyframes dmx-ripple {
		0%,
		100% {
			opacity: 0.08;
		}
		50% {
			opacity: 0.92;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dmx-dot {
			animation: none;
			opacity: var(--static-opacity);
		}
	}
</style>
