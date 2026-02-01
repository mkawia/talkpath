export const internalCookieName = 'internaluser';

//expiry bumps and expires
export const cookieExpiryAtHoursLimit = 8;
//only bump expires_at if the remainder is 1/4 left
export const shouldUpdateExpiresAtHours = Math.round(cookieExpiryAtHoursLimit / 4);

export type InternalUserLogin = {
	key: string;

	email: string;
	name: string;

	role: 'admin' | 'mod';

	isActive: boolean;

	createdAt: string;
	updatedAt: string;

	activeLogin: {
		key: string;
		//logged_in_ip: string;
		expiresAt: string;
	};
};
