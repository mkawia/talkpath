import validateUuid from 'uuid-validate';

import type { Cookies } from '@sveltejs/kit';

//expiry bumps and expires
const cookieExpiryAtHoursLimit = 1;
const cookieExpiryAtHoursLimitInMinutes = cookieExpiryAtHoursLimit * 60;
//only bump expires_at if the remainder is 1/4 left
const shouldUpdateExpiresAtMinutes = Math.round(cookieExpiryAtHoursLimitInMinutes / 10);
const minutesLessToBumpLastSeen = 20;
//console.log('shouldUpdateExpiresAtMinutes', shouldUpdateExpiresAtMinutes);

const minutesThatMeansCookieIsExpired = 2;

import { dev } from '$app/environment';
import {
	publicUserCookieName,
	type PublicUserLogin,
	bumpLastSeenAt,
	renewCookie,
	addHoursToDate,
	addDaysToDate,
	calculateDiffMinutes
} from './utils';
import { assertDateToIsoString } from '$lib/utils';
import { LoginRow } from '$lib/db/schema/public_users/login_rows';
import { eq } from 'drizzle-orm';
import { PublicUser } from '$lib/db/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

//figure out date cookie was baked
export const eatPublicUserCookie = async (eatCookiesParams: {
	cookies: Cookies;
	db: PostgresJsDatabase;
	requestUrl: string;
}): Promise<PublicUserLogin | null> => {
	const { cookies, db, requestUrl } = eatCookiesParams;

	const loginKeyFromCookie = cookies.get(publicUserCookieName);
	if (!loginKeyFromCookie) {
		return Promise.resolve(null);
	}
	if (!validateUuid(loginKeyFromCookie)) {
		/*logWarningInfo({
			requestId: locals.requestId,
			code: 'INVALID_PUBLICUSER_COOKIE_BAD_UUID',
			msg: `Invalid publicuser cookie, bad uuid: ${loginKeyFromCookie}`
		});*/
		return Promise.resolve(null);
	}

	const foundLoginRows = await db
		.select()
		.from(LoginRow)
		.where(eq(LoginRow.key, loginKeyFromCookie));

	if (foundLoginRows.length === 0) {
		return Promise.resolve(null);
	}

	const loginRow = foundLoginRows[0];
	//make sure it's active
	if (!loginRow.isActive) {
		return Promise.resolve(null);
	}

	//diff between now and expiry if less than 1 ie 0
	const expiryDiffMinutes = calculateDiffMinutes({
		big: new Date(loginRow.expiresAt),
		small: new Date()
	});
	if (expiryDiffMinutes < minutesThatMeansCookieIsExpired) {
		//const msg = `${loginObj.expires_at.toISOString()} - ${new Date().toISOString()} = ${expiryDiffHours}`;
		/*console.log(
			'fails here',
			'expiryDiffMinutes',
			expiryDiffMinutes,
			'minutesThatMeansCookieIsExpired',
			minutesThatMeansCookieIsExpired
		); */
		return Promise.resolve(null);
	}
	/*console.log(
		"Hasn't expired yet",
		'expiryDiffMinutes',
		expiryDiffMinutes,
		'minutesThatMeansCookieIsExpired',
		minutesThatMeansCookieIsExpired
	);*/

	//try fetching the user
	const publicUsersRows = await db
		.select()
		.from(PublicUser)
		.where(eq(PublicUser.key, loginRow.publicUser));

	if (!publicUsersRows.length) {
		//this is alarming!
		//	request.log.error(`Login row ${loginObj.key} points to a user that doesn't exist, why?`);
		return Promise.resolve(null);
	}

	const publicUser = publicUsersRows[0];

	if (!publicUser.isActive) {
		return Promise.resolve(null);
	}

	/*let userHasPassword = false;
	if (publicUser.hash) {
		userHasPassword = true;
	}*/

	//get of hash field
	//delete publicUser.hash;

	//login
	//publicUser.login = loginObj;

	//just a quick bump, an hour passed
	const diffNowAndLastSeenMinutes = calculateDiffMinutes({
		big: new Date(),
		small: new Date(loginRow.lastSeenAt)
	});

	//bump expires_at is very low ie 1
	if (expiryDiffMinutes <= shouldUpdateExpiresAtMinutes) {
		await renewCookie({
			loginKey: loginKeyFromCookie,
			db: db,
			requestUrl: requestUrl
		});
	}

	//last seen bumps
	if (diffNowAndLastSeenMinutes >= minutesLessToBumpLastSeen) {
		bumpLastSeenAt(loginKeyFromCookie, db);
	}

	return Promise.resolve({
		//public user fiels
		key: publicUser.key,

		fullName: publicUser.fullName,
		email: publicUser.email,

		isActive: publicUser.isActive,

		createdAt: assertDateToIsoString(publicUser.createdAt),
		updatedAt: assertDateToIsoString(publicUser.updatedAt),

		login: {
			key: loginRow.key,

			expiresAt: assertDateToIsoString(loginRow.expiresAt),

			lastSeenAt: assertDateToIsoString(loginRow.lastSeenAt),

			isActive: loginRow.isActive,

			createdAt: assertDateToIsoString(publicUser.createdAt),
			updatedAt: assertDateToIsoString(publicUser.updatedAt)
		}
	});
};

const makeNewLogin = async (newLoginParams: { publicUserKey: string; locals: App.Locals }) => {
	const { publicUserKey, locals } = newLoginParams;
	const { db } = locals;

	//generate a new key into a variable to set as cookie content
	const newLoginKey = crypto.randomUUID();
	//4 hours from now
	const cookieTokenExpiresAt = addHoursToDate(new Date(), cookieExpiryAtHoursLimit);

	const newLoginPayload = {
		key: newLoginKey,
		publicUser: publicUserKey,
		isActive: true,
		expiresAt: cookieTokenExpiresAt.toISOString(),
		lastSeenAt: new Date().toISOString()
	};

	const newLoginInsertResultRows = await db.insert(LoginRow).values(newLoginPayload).returning();

	//check if the insert was successful
	if (newLoginInsertResultRows.length === 0) {
		//logErrorInfo({
		//	requestId: locals.requestId,
		//	code: 'FAILED_NEW_LOGIN_INSERT',
		//	msg: `Failed to insert new login row for public user ${publicUserKey}`
		//});
		throw new Error('Failed to insert new login row');
	}

	//if more than one
	if (newLoginInsertResultRows.length > 1) {
		//logErrorInfo({
		//	requestId: locals.requestId,
		//	code: 'MULTIPLE_NEW_LOGIN_INSERTS',
		//	msg: `Multiple new login rows inserted for public user ${publicUserKey}`
		//});
		throw new Error('Multiple new login rows inserted');
	}

	const createdLoginRow = newLoginInsertResultRows[0];

	//return the best estimation of the new login without fetching it
	return createdLoginRow;
};

//obscucate cookie
export const bakePublicUserCookie = async (bakeCookieParams: {
	publicUserKey: string;
	cookies: Cookies;
	locals: App.Locals;
}) => {
	const { publicUserKey, cookies, locals } = bakeCookieParams;

	//we are creating new one every time, it's good for logging ...log ins
	//There won't be any collision each user agent overwrites on client
	const loginObj = await makeNewLogin({
		publicUserKey: publicUserKey,
		locals: locals
	});

	//the actual cookie expires in seven days
	const cookieExpiryDate = addDaysToDate(new Date(), 7);
	const cookieSettings = {
		path: '/',
		httpOnly: true,
		//commented out to see if google redirects will work on firefox
		//sameSite: true,
		secure: dev ? false : true,
		expires: cookieExpiryDate
	};

	cookies.set(publicUserCookieName, loginObj.key, cookieSettings);

	//log this successful login
	/*logOkInfo({
		requestId: locals.requestId,
		code: 'NEW_PUBLIC_USER_LOGIN',
		payload: loginObj
	});*/

	return Promise.resolve(true);
};
