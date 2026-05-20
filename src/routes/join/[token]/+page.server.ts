import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { validateInvite, consumeInvite } from '$lib/server/invites';
import { completeJoinConversion } from '$lib/server/join-conversion';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { eq } from 'drizzle-orm';
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

		let userId: string | undefined;

		try {
			const signup = await auth.api.signUpEmail({
				body: { name, email, password, callbackURL: '/welcome' }
			});
			userId = (signup as { user?: { id: string } })?.user?.id;
		} catch (e) {
			if (e instanceof APIError) {
				return fail(400, { message: e.message || 'Registration failed.' });
			}
			return fail(500, { message: 'Unexpected error.' });
		}

		if (!userId) {
			const [row] = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
			userId = row?.id;
		}

		if (!userId) {
			return fail(500, { message: 'Account was created but could not be linked. Contact support.' });
		}

		const consumed = await consumeInvite(params.token);
		if (!consumed) {
			return fail(400, { message: 'This invite is no longer valid.' });
		}

		await completeJoinConversion({
			userId,
			email,
			inviteRow: consumed
		});

		redirect(302, '/welcome');
	}
};
