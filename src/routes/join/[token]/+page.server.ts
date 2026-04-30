import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { validateInvite, consumeInvite } from '$lib/server/invites';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = async ({ params }) => {
	const result = await validateInvite(params.token);

	if (!result.valid || !result.invite) {
		error(404, result.reason === 'already_used' ? 'This invite has already been used.' : 'Invalid invite link.');
	}

	return { email: result.invite.email ?? null };
};

export const actions: Actions = {
	default: async ({ params, request }) => {
		const result = await validateInvite(params.token);

		if (!result.valid || !result.invite) {
			return fail(400, { message: 'This invite is no longer valid.' });
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString() ?? '';
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (result.invite.email && result.invite.email.toLowerCase() !== email.toLowerCase()) {
			return fail(400, { message: 'This invite was created for a different email address.' });
		}

		try {
			await auth.api.signUpEmail({ body: { name, email, password, callbackURL: '/welcome' } });
		} catch (e) {
			if (e instanceof APIError) {
				return fail(400, { message: e.message || 'Registration failed.' });
			}
			return fail(500, { message: 'Unexpected error.' });
		}

		await consumeInvite(params.token);
		redirect(302, '/welcome');
	}
};
