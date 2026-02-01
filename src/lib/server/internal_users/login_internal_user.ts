import { compare as comparePass } from 'bcrypt';

import { eq } from 'drizzle-orm';
import { InternalUser } from '$lib/db/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { bakeInternalUserCookie } from './cookies';
import type { Cookies } from '@sveltejs/kit';

export const verifyLoginInternalUserCredentials = async (params: {
	email: string;
	password: string;
	db: PostgresJsDatabase;
	cookies: Cookies;
}): Promise<{
	wrong_credentials: boolean;
	userKey: string | null;
	error: {
		errorCode: 'NO_USER_WITH_THAT_EMAIL' | 'WRONG_PASSWORD' | 'COOKIE_BAKE_ERROR';
		errorPayload: unknown;
	} | null;
}> => {
	//destructuring
	const { email, password, db, cookies } = params;

	//querying
	const internalUsers = await db
		.select()
		.from(InternalUser)
		.where(eq(InternalUser.email, email))
		.limit(1);
	if (internalUsers.length === 0) {
		return {
			wrong_credentials: false,
			userKey: null,
			error: {
				errorCode: 'NO_USER_WITH_THAT_EMAIL',
				errorPayload: null
			}
		};
	}
	const internalUser = internalUsers[0];
	const res = await comparePass(password, internalUser.hash);
	if (!res) {
		return {
			wrong_credentials: false,
			userKey: internalUser.key,
			error: {
				errorCode: 'WRONG_PASSWORD',
				errorPayload: null
			}
		};
	}

	try {
		await bakeInternalUserCookie({
			internalUser: internalUser,
			cookies: cookies,
			db: db
		});
		return { wrong_credentials: false, userKey: internalUser.key, error: null };
	} catch (err) {
		return {
			wrong_credentials: false,
			userKey: internalUser.key,
			error: {
				errorCode: 'COOKIE_BAKE_ERROR',
				errorPayload: err
			}
		};
	}
};
