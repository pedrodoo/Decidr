<script lang="ts">
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
		<button class="modal-backdrop-close" type="button" aria-label="Close bug report dialog" onclick={onClose}
		></button>

		<div class="modal bug-report-modal">
			<div class="modal-header">
				<h2 id="bug-report-title" class="modal-title">Report a bug</h2>
				<button class="modal-close" type="button" aria-label="Close bug report dialog" onclick={onClose}>✕</button>
			</div>

			<form class="modal-body bug-form" onsubmit={handleSubmit}>
				<label class="field-label" for="bug-description">
					What is happening? <span class="required" aria-label="required">*</span>
				</label>
				<textarea
					id="bug-description"
					name="description"
					rows="3"
					placeholder="Describe the bug as clearly as possible."
					class="short"
					bind:value={description}
					required
				></textarea>

				<label class="field-label" for="bug-where-found">
					Where did it happen? <span class="required" aria-label="required">*</span>
				</label>
				<input
					id="bug-where-found"
					name="whereFound"
					type="text"
					placeholder="e.g. outputs page after generating response"
					bind:value={whereFound}
					required
				/>

				<label class="field-label" for="bug-email">
					Your email <span class="required" aria-label="required">*</span>
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
					<button class="btn-secondary" type="button" onclick={onClose} disabled={submitting}>Cancel</button>
					<button class="btn-primary bug-submit-btn" type="submit" disabled={submitting}>
						{submitting ? 'Sending...' : 'Submit report'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
