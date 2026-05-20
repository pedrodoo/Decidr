<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		src: string;
		cols?: number;
		fontSize?: number;
		// Pixels below this brightness (0–1) are treated as background → space.
		// Increase if dark background bleeds into the output.
		bgThreshold?: number;
	}

	let { src, cols = 60, fontSize = 6, bgThreshold = 0.18 } = $props();

	// Sparse → dense: dark/transparent areas become space, bright areas become dense chars
	const CHARS = ' .,:;i1tfLCG08@#';

	let lines = $state<string[]>([]);
	let canvas: HTMLCanvasElement;

	onMount(() => {
		const img = new Image();
		img.onload = () => {
			// Monospace chars are ~2:1 (h:w), so halve row count to preserve aspect ratio
			const rows = Math.round((img.naturalHeight / img.naturalWidth) * cols * 0.5);
			canvas.width = cols;
			canvas.height = rows;

			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(img, 0, 0, cols, rows);

			const { data } = ctx.getImageData(0, 0, cols, rows);
			const result: string[] = [];

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

					// Remap brightness from [bgThreshold, 1] → [0, 1] for full char range
					const normalised = (brightness - bgThreshold) / (1 - bgThreshold);
					line += CHARS[Math.floor(normalised * (CHARS.length - 1))];
				}
				result.push(line);
			}
			lines = result;
		};
		img.src = src;
	});
</script>

<canvas bind:this={canvas} style="display:none" aria-hidden="true"></canvas>

{#if lines.length}
	<pre
		class="ascii-cat"
		style="--fs:{fontSize}px"
		aria-hidden="true"
	>{lines.join('\n')}</pre>
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
		animation: cat-float 5s ease-in-out infinite;
	}

	@keyframes cat-float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ascii-cat {
			animation: none;
		}
	}
</style>
