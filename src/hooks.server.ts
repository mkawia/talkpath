import type { Handle, HandleServerError } from '@sveltejs/kit';

import db from '$lib/db';

import { eatPublicUserCookie } from '$lib/server/public_users/cookies';
import { stringifyIt } from '$lib/utils';
import { dev } from '$app/environment';
import { eatInternalUserCookie } from '$lib/server/internal_users/cookies';

/*

*/
export const handle = (async ({ event, resolve }) => {
	//populate internal user login
	const [publicUserLoginInCookie, internalUserLoginInCookie] = await Promise.all([
		eatPublicUserCookie({
			cookies: event.cookies,
			db: db,
			requestUrl: event.request.url
		}),
		eatInternalUserCookie({
			cookies: event.cookies,
			db: db,
			requestUrl: event.request.url
		})
	]);

	event.locals.publicUserLogin = publicUserLoginInCookie;
	event.locals.internalUserLogin = internalUserLoginInCookie;

	event.locals.db = db;

	const response = await resolve(event);

	return response;
}) satisfies Handle;

//if some one throws
export const handleError = (async ({ error }) => {
	if (dev) {
		console.log('Unhandled error :', error);
	}
	const errMessage = stringifyIt(error);

	return {
		message: errMessage
	};
}) satisfies HandleServerError;
