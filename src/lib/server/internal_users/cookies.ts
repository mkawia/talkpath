import validateUuid from 'uuid-validate';
import dayjs from 'dayjs';

import { eq } from 'drizzle-orm';
import type { Cookies } from '@sveltejs/kit';

import { dev } from '$app/environment';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import {
	cookieExpiryAtHoursLimit,
	internalCookieName,
	shouldUpdateExpiresAtHours,
	type InternalUserLogin
} from './constants';
import { InternalUser } from '$lib/db/schema';
import { renewInternalCookie } from './internal_users_fns';

export const eatInternalUserCookie = async (eatInternalUserCookiesParams: {
	cookies: Cookies;
	db: PostgresJsDatabase;
	requestUrl: string;
}): Promise<InternalUserLogin | null> => {
	const { cookies, db, requestUrl } = eatInternalUserCookiesParams;

	const internalUserCookie = cookies.get(internalCookieName);
	if (!internalUserCookie) {
		//no cookie completely ok
		return Promise.resolve(null);
	}
	if (!validateUuid(internalUserCookie)) {
		//bad cookies kinda concerning
		return Promise.resolve(null);
	}

	//in the future	we'll have a dedicated internal user login table
	const loginKey = internalUserCookie;
	const internalUsers = await db
		.select()
		.from(InternalUser)
		.where(eq(InternalUser.activeLogin, loginKey))
		.limit(1);
	if (internalUsers.length === 0) {
		//valid uuid non existant user, concerning
		return null;
	}

	const internalUser = internalUsers[0];

	//make sure it's active, maybe they were disabled
	if (!internalUser.isActive) {
		return Promise.resolve(null);
	}

	//doing this check to quite typescript
	if (!internalUser.activeLogin) {
		return Promise.resolve(null);
	}

	//if somehow forgot to set activeLoginExpires with the activeLogin
	if (!internalUser.activeLoginExpires) {
		console.error('activeLoginExpires without activeLogin');
		return Promise.resolve(null);
	}

	//diff between now and expiry if less than 1 ie 0
	//we'll use dayjs to calculate the difference in hours
	const expiryDiffHours = dayjs(internalUser.activeLoginExpires).diff(dayjs(), 'hour');
	if (expiryDiffHours < 1) {
		return Promise.resolve(null);
	}

	//bump expires_at is very low ie 1
	if (expiryDiffHours <= shouldUpdateExpiresAtHours) {
		renewInternalCookie({
			db: db,
			internalUser: {
				key: internalUser.key,
				isActive: internalUser.isActive,
				activeLogin: internalUser.activeLogin,
				activeLoginExpires: internalUser.activeLoginExpires
			},
			requestUrl: requestUrl
		});
	}

	return Promise.resolve({
		key: internalUser.key,

		email: internalUser.email,
		name: internalUser.name,

		role: internalUser.role,

		isActive: internalUser.isActive,

		createdAt: internalUser.createdAt,
		updatedAt: internalUser.updatedAt,

		activeLogin: {
			key: internalUser.activeLogin,
			expiresAt: internalUser.activeLoginExpires
		}
	});
};

const makeNewLogin = async (
	internalUser: {
		key: string;
		isActive: boolean;
		activeLogin: string | null;
		activeLoginExpires: string | null;
	},
	db: PostgresJsDatabase
) => {
	//check if internal user is still active
	if (!internalUser.isActive) {
		return Promise.reject('ERROR_INTERNAL_USER_NOT_ACTIVE');
	}

	//cookieExpiryAtHoursLimit hours from now, use dayjs
	//	const newExpiresAt = addHours(new Date(), cookieExpiryAtHoursLimit);
	const newExpiresAt = dayjs().add(cookieExpiryAtHoursLimit, 'hour').toDate();

	//decide if we are creating and new active login or updating existing one
	if (internalUser.activeLogin) {
		//update existing login
		await db
			.update(InternalUser)
			.set({
				activeLogin: internalUser.activeLogin,
				activeLoginExpires: newExpiresAt.toISOString()
			})
			.where(eq(InternalUser.key, internalUser.key));

		return internalUser.activeLogin;
	} else {
		//create new login
		const newLoginKey = crypto.randomUUID();
		await db
			.update(InternalUser)
			.set({
				activeLogin: newLoginKey,
				activeLoginExpires: newExpiresAt.toISOString()
			})
			.where(eq(InternalUser.key, internalUser.key));

		return newLoginKey;
	}
};

export const bakeInternalUserCookie = async (bakeCookieParams: {
	internalUser: {
		key: string;
		isActive: boolean;
		activeLogin: string | null;
		activeLoginExpires: string | null;
	};
	cookies: Cookies;
	db: PostgresJsDatabase;
}) => {
	const { internalUser, cookies, db } = bakeCookieParams;

	const loginKey = await makeNewLogin(internalUser, db);

	//the actual cookie expires in seven days
	//	const cookieExpiryDate = addDays(new Date(), 7);
	const cookieExpiryAt = dayjs().add(cookieExpiryAtHoursLimit, 'hour').toDate();
	const cookieSettings = {
		path: '/',
		httpOnly: true,

		//commented out to see if google redirects will work
		//sameSite: true,

		secure: dev ? false : true,

		expires: cookieExpiryAt
	};

	cookies.set(internalCookieName, loginKey, cookieSettings);

	return Promise.resolve(true);
};
