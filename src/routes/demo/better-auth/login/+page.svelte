<!-- Demo: Better Auth login form. Action: signInEmail. Sign-up removed — app is invite-only. Form errors in form.message. -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { strings } from '$lib/strings.js';

	let { form }: { form: ActionData } = $props();
	const s = strings.demo;
</script>

<h1>{s.loginTitle}</h1>
<form method="post" action="?/signInEmail" use:enhance>
	<label>
		Email
		<input type="email" name="email" />
	</label>
	<label>
		Password
		<input type="password" name="password" />
	</label>
	<button>{s.loginButton}</button>
</form>
<p style="color: var(--semantic-danger)">{form?.message ?? ''}</p>
