<script lang="ts">
	import { autoresize } from '$lib/actions/autoresize';
	import { strings } from '$lib/strings.js';
	type BugFormValues = {
		description: string;
		whereFound: string;
		email: string;
	};

	type Props = {
		open: boolean;
		email: string;
		submitting: boolean;
		errorMessage: string;
		onClose: () => void;
		onSubmit: (values: BugFormValues) => Promise<void>;
	};

	let { open, email, submitting, errorMessage, onClose, onSubmit }: Props = $props();
	const s = strings.bugReport;

	let description = $state('');
	let whereFound = $state('');
	let currentEmail = $state('');

	$effect(() => {
		if (open) {
			description = '';
			whereFound = '';
			currentEmail = email;
		}
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		await onSubmit({
			description,
			whereFound,
			email: currentEmail
		});
	}
</script>

{#if open}
	<div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="bug-report-title">
		<button class="modal-backdrop-close" type="button" aria-label={s.closeDialogAria} onclick={onClose}
		></button>

		<div class="modal bug-report-modal">
			<div class="modal-header">
				<h2 id="bug-report-title" class="modal-title">{s.title}</h2>
				<button class="modal-close" type="button" aria-label={s.closeDialogAria} onclick={onClose}>✕</button>
			</div>

			<form class="modal-body bug-form" onsubmit={handleSubmit}>
				<label class="field-label" for="bug-description">
					{s.labels.happening} <span class="required" aria-label={s.labels.required}>*</span>
				</label>
				<textarea
					id="bug-description"
					name="description"
					use:autoresize={description}
					placeholder={s.placeholders.description}
					bind:value={description}
					required
				></textarea>

				<label class="field-label" for="bug-where-found">
					{s.labels.where} <span class="required" aria-label={s.labels.required}>*</span>
				</label>
				<input
					id="bug-where-found"
					name="whereFound"
					type="text"
					placeholder={s.placeholders.where}
					bind:value={whereFound}
					required
				/>

				<label class="field-label" for="bug-email">
					{s.labels.email} <span class="required" aria-label={s.labels.required}>*</span>
				</label>
				<input
					id="bug-email"
					name="email"
					type="email"
					bind:value={currentEmail}
					required
				/>

				{#if errorMessage}
					<p class="error-msg" role="alert">{errorMessage}</p>
				{/if}

				<div class="bug-form-actions">
					<button class="btn-secondary" type="button" onclick={onClose} disabled={submitting}
						>{s.actions.cancel}</button
					>
					<button class="btn-primary bug-submit-btn" type="submit" disabled={submitting}>
						{submitting ? s.actions.submitting : s.actions.submit}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
