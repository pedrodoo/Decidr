<!-- Demo: Better Auth — shows signed-in user from session; sign-out form. Data from +page.server.ts. -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';
	import { strings } from '$lib/strings.js';

	let { data }: { data: PageServerData } = $props();
	const s = strings.demo;
</script>

<h1>Hi, {data.user.name}!</h1>
<p>Your user ID is {data.user.id}.</p>
<form method="post" action="?/signOut" use:enhance>
	<button>{s.signOut}</button>
</form>
