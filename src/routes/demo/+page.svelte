<!-- Demo index: links to Better Auth and Playwright demo pages. -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { strings } from '$lib/strings.js';
	const s = strings.demo;
</script>

<a href={resolve('/demo/better-auth')}>{s.betterAuth}</a>
<a href={resolve('/demo/playwright')}>{s.playwright}</a>
