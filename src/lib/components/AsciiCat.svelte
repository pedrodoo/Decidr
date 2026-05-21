<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		src: string;
		cols?: number;
		fontSize?: number;
		bgThreshold?: number;
	}

	let { src, cols = 60, fontSize = 6, bgThreshold = 0.22 } = $props();

	const CHARS = ' .,:;i1tfLCG08@#';

	let ascii = $state('');
	let hovered = $state(false);
	let canvas: HTMLCanvasElement;

	onMount(() => {
		const img = new Image();
		img.onload = () => {
			const rows = Math.round((img.naturalHeight / img.naturalWidth) * cols * 0.5);
			canvas.width = cols;
			canvas.height = rows;

			const ctx = canvas.getContext('2d')!;

			// Boost contrast so the dark background drops cleanly below threshold
			// and the cat's 3D shading stays visible in the mid-tones
			ctx.filter = 'contrast(140%) brightness(108%)';
			ctx.drawImage(img, 0, 0, cols, rows);
			ctx.filter = 'none';

			const { data } = ctx.getImageData(0, 0, cols, rows);
			const lines: string[] = [];

			for (let y = 0; y < rows; y++) {
				let line = '';
				for (let x = 0; x < cols; x++) {
					const i = (y * cols + x) * 4;
					const a = data[i + 3];
					const r = data[i],
						g = data[i + 1],
						b = data[i + 2];
					const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

					if (a < 30 || brightness < bgThreshold) {
						line += ' ';
						continue;
					}

					const normalised = (brightness - bgThreshold) / (1 - bgThreshold);
					line += CHARS[Math.floor(normalised * (CHARS.length - 1))];
				}
				lines.push(line);
			}
			ascii = lines.join('\n');
		};
		img.src = src;
	});
</script>

<canvas bind:this={canvas} style="display:none" aria-hidden="true"></canvas>

{#if ascii}
	<pre
		class="ascii-cat"
		class:hovered
		style="--fs:{fontSize}px"
		aria-hidden="true"
		onmouseenter={() => (hovered = true)}
		onmouseleave={() => (hovered = false)}
	>{ascii}</pre>
{/if}

<style>
	.ascii-cat {
		font-family: var(--font-mono);
		font-size: var(--fs);
		line-height: 1.2;
		color: white;
		opacity: 0.82;
		white-space: pre;
		user-select: none;
		letter-spacing: 0;
		margin: 0;
		padding: 0;
		/* Pivot near the base so the raised paw arcs further than the body */
		transform-origin: 50% 90%;
		animation: cat-float 7s ease-in-out infinite;
		transition: opacity 0.3s;
		cursor: default;
	}

	/* On hover: pause the float, rock the whole cat.
	   Because the paw is at the top-left, rocking ±6° makes it
	   trace a larger arc than the body — the "wave" effect. */
	.hovered {
		animation: cat-wave 1.4s ease-in-out infinite;
		opacity: 1;
	}

	@keyframes cat-float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-3px);
		}
	}

	@keyframes cat-wave {
		0%,
		100% {
			transform: rotate(0deg);
		}
		25% {
			transform: rotate(-4deg);
		}
		75% {
			transform: rotate(4deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ascii-cat {
			animation: none;
		}
	}
</style>
