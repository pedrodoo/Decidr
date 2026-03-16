<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<script>
  import '@fontsource/sora/300.css';
  import '@fontsource/sora/400.css';
  import '@fontsource/sora/500.css';
  import '@fontsource/sora/600.css';
  import '@fontsource/sora/700.css';
  import '@fontsource/ibm-plex-mono/400.css';
  import '@fontsource/ibm-plex-mono/500.css';
  import '../app.css';
</script>

<slot />