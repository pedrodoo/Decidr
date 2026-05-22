/**
 * Grows a textarea to fit its content. Re-runs when the bound value changes externally
 * (e.g. localStorage hydration). Respects CSS max-height when content exceeds the cap.
 */
export function autoresize(
	node: HTMLTextAreaElement,
	_value?: string
): { update: (value?: string) => void; destroy: () => void } {
	function resize() {
		node.style.height = 'auto';
		const { minHeight, maxHeight } = getComputedStyle(node);
		const minPx = parseFloat(minHeight);
		const maxPx = parseFloat(maxHeight);
		const scrollHeight = node.scrollHeight;
		const target = Number.isFinite(minPx) && minPx > 0 ? Math.max(scrollHeight, minPx) : scrollHeight;

		if (Number.isFinite(maxPx) && maxPx > 0 && target > maxPx) {
			node.style.height = `${maxPx}px`;
			node.style.overflowY = 'auto';
		} else {
			node.style.height = `${target}px`;
			node.style.overflowY = 'hidden';
		}
	}

	node.addEventListener('input', resize);
	const observer = new ResizeObserver(resize);
	observer.observe(node);
	queueMicrotask(resize);

	return {
		update() {
			resize();
		},
		destroy() {
			node.removeEventListener('input', resize);
			observer.disconnect();
			node.style.height = '';
			node.style.overflowY = '';
		}
	};
}
