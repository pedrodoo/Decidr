<!-- Demo: Better Auth login/register form. Actions: signInEmail, signUpEmail. Form errors in form.message. -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<h1>Login</h1>
<form method="post" action="?/signInEmail" use:enhance>
	<label>
		Email
		<input type="email" name="email" />
	</label>
	<label>
		Password
		<input type="password" name="password" />
	</label>
	<label>
		Name (for registration)
		<input name="name" />
	</label>
	<button>Login</button>
	<button
		formaction="?/signUpEmail"
		disabled
		aria-disabled="true"
		title="Invite only. Request access from the homepage form."
	>
		Invite only - request access on homepage
	</button>
</form>
<p style="color: red">{form?.message ?? ''}</p>
