//cookies utils

//import { dev } from '$app/environment';
import { error, type Cookies } from '@sveltejs/kit';

import dayjs from 'dayjs';
import { genSalt, hash } from 'bcrypt';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { LoginRow } from '$lib/db/schema/public_users/login_rows';

export const publicUserCookieName = 'publicuser';
const cookieExpiryAtHoursLimit = 4;

/* types */

export type PublicUserLogin = {
	key: string;

	email: string;

	//names
	fullName: string;

	//putting this here for now, maybe in the future we'll populate publicUserLogin with isActive is false to show them some page
	isActive: boolean;

	//dates
	createdAt: string;
	updatedAt: string;

	login: {
		key: string;
		expiresAt: string;

		lastSeenAt: string;

		isActive: boolean;

		createdAt: string;
		updatedAt: string;
	};
};

export const getCookieMinutesLeft = (pul: PublicUserLogin) => {
	const expiresAt = dayjs(pul.login.expiresAt);
	const now = dayjs();
	const diff = expiresAt.diff(now, 'minutes');
	return diff;
};

export const renewCookie = async (params: {
	loginKey: string;
	db: PostgresJsDatabase;
	requestUrl: string;
}) => {
	//using pul, we assume whoever created pul did it correctly with the eatPublicCookie fn

	const { loginKey, db, requestUrl } = params;

	const urlObj = new URL(requestUrl);
	//if url is /public_api/get_me, don't bump last seen
	if (urlObj.pathname === '/public_api/get_me') {
		return;
	}

	const newExpiresAt = addHoursToDate(new Date(), cookieExpiryAtHoursLimit);

	await db
		.update(LoginRow)
		.set({
			expiresAt: newExpiresAt.toISOString()
		})
		.where(eq(LoginRow.key, loginKey));
};

export const logOutPublicUser = async (params: {
	pul: PublicUserLogin;
	cookies: Cookies;
	db: PostgresJsDatabase;
	dev: boolean;
}) => {
	const { pul, cookies, db, dev } = params;

	//first set is_active
	await db
		.update(LoginRow)
		.set({
			isActive: false
		})
		.where(eq(LoginRow.key, pul.login.key));

	//then set cookie
	const logOutCookieSettings = {
		path: '/',
		httpOnly: true,

		//sameSite: true,

		secure: dev ? false : true,

		expires: new Date(0)
	};

	cookies.set(publicUserCookieName, '', logOutCookieSettings);
};

export const bumpLastSeenAt = (loginKey: string, db: PostgresJsDatabase) => {
	//don't await it
	db.update(LoginRow)
		.set({
			lastSeenAt: new Date().toISOString()
		})
		.where(eq(LoginRow.key, loginKey))
		.catch((e) => {
			console.error('bumpLastSeen error', e);
		});
};

export const addHoursToDate = (dateTimeInput: Date, numOfHours: number) => {
	//use dayjs
	const dateTimeInputDayJs = dayjs(dateTimeInput);
	const dateTimeAfterHours = dateTimeInputDayJs.add(numOfHours, 'hours');
	/*console.error(
		`${numOfHours} hours after ${dateTimeInput.toISOString()} is ${dateTimeAfterHours.toISOString()}`
	);*/
	return dateTimeAfterHours.toDate();
};

export const addDaysToDate = (date: string | Date, days: number) => {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
};

export const calculateDiffMinutes = (params: { big: Date; small: Date }) => {
	const { big, small } = params;
	const bigDate = typeof big.getTime === 'function' ? big : new Date(big);
	const smallDate = typeof small.getTime === 'function' ? small : new Date(small);

	const diff = bigDate.getTime() - smallDate.getTime();
	return Math.round(diff / 60000);
};

const saltRounds = 10;
export const makePublicUserPasswordHash = async (password: string) => {
	const salt = await genSalt(saltRounds);
	const hashed = await hash(password, salt);
	return hashed;
};

export const assertPublicUserLogin = (pul: PublicUserLogin | null) => {
	if (!pul) {
		const errObj = {
			message: 'assertPublicUserLogin failed, expected publicUserLogin to be truthy',
			errorCode: 'INTERNAL_ERROR_FALSY_PUBLICUSERLOGIN'
		};
		throw error(500, JSON.stringify(errObj));
	}
	return pul;
};
