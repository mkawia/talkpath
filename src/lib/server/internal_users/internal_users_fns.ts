import { InternalUser } from '$lib/db/schema';
import type { Cookies } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { cookieExpiryAtHoursLimit, internalCookieName, type InternalUserLogin } from './constants';
import { dev } from '$app/environment';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import dayjs from 'dayjs';

export const logOutInternalUser = async (params: {
	internalUserLogin: InternalUserLogin;
	cookies: Cookies;
	db: PostgresJsDatabase;
	dev: boolean;
}) => {
	const { internalUserLogin, cookies, db, dev } = params;

	if (internalUserLogin && internalUserLogin.activeLogin) {
		await db
			.update(InternalUser)
			.set({ activeLogin: null, activeLoginExpires: null })
			.where(eq(InternalUser.key, internalUserLogin.key));

		const logOutCookieSettings = {
			path: '/',
			httpOnly: true,

			//sameSite: true,

			secure: dev ? false : true,

			expires: new Date(0)
		};

		cookies.set(internalCookieName, '', logOutCookieSettings);
	}
};

//renew cookie method
export const renewInternalCookie = async (params: {
	internalUser: {
		key: string;
		isActive: boolean;
		activeLogin: string | null;
		activeLoginExpires: string | null;
	};
	db: PostgresJsDatabase;
	requestUrl: string;
}) => {
	const { internalUser, db, requestUrl } = params;

	const urlObj = new URL(requestUrl);
	//if url is /public_api/get_me, don't bump last seen
	if (urlObj.pathname === '/public_api/get_me_internal_user') {
		return;
	}

	if (dev) {
		console.log('renewInternalCookie called for', internalUser.key);
	}

	//using dayjs add hours
	const newExpiresAt = dayjs().add(cookieExpiryAtHoursLimit, 'hour').toDate();
	if (internalUser && internalUser.activeLogin) {
		await db
			.update(InternalUser)
			.set({
				activeLogin: internalUser.activeLogin,
				activeLoginExpires: newExpiresAt.toISOString()
			})
			.where(eq(InternalUser.key, internalUser.key));
	}
};

export const getCookieMinutesLeft = (params: { activeLoginExpires: string | null }): number => {
	const { activeLoginExpires } = params;

	if (!activeLoginExpires) {
		return 0;
	}

	const expiresAt = dayjs(activeLoginExpires);
	const now = dayjs();
	const minutesLeft = expiresAt.diff(now, 'minute');

	return Math.max(minutesLeft, 0); // Ensure we don't return negative minutes
};
