import { InternalUser } from '$lib/db/schema';
import { genSalt, hash } from 'bcrypt';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as crypto from 'crypto';
import { defaultInternalUsers } from './default_internal_users';

//import { genSalt, hash } from 'bcrypt';
//import validate_uuid from 'uuid-validate';

//type NewUser = typeof InternalUser.$inferInsert;

export async function storeInternalUser(params: {
	name: string;
	email: string;
	role: 'admin' | 'mod';
	avatarUrl?: string;
	password: string;
	db: PostgresJsDatabase;
}) {
	const { name, email, role, avatarUrl, password, db } = params;

	const key = crypto.randomUUID();

	try {
		const createdHash = await makeInternalUserPasswordHash(password);

		const newObject: {
			key: string;
			name: string;
			email: string;
			hash: string;
			role: 'admin' | 'mod';
			isActive?: boolean | undefined;
			avatarUrl?: string | null | undefined;
		} = {
			key: key,
			name: name,
			email: email,
			hash: createdHash,
			role: role,
			avatarUrl: avatarUrl ? avatarUrl : null
		};

		const createdInternalUsersRes = await db
			.insert(InternalUser)
			.values(newObject)
			.returning()
			.execute();
		if (createdInternalUsersRes.length === 0) {
			return Promise.reject('Failed to create internal user, length is 0');
		}
		if (createdInternalUsersRes.length > 1) {
			return Promise.reject('Failed to create internal user, length is > 1');
		}

		return createdInternalUsersRes[0];
	} catch (error) {
		if (checkIfEmailUniqueError(error)) {
			return Promise.reject('EMAILEXISTS');
		}
		return Promise.reject(error);
	}
}

const saltRounds = 10;
export const makeInternalUserPasswordHash = async (password: string) => {
	const salt = await genSalt(saltRounds);
	const hashed = await hash(password, salt);
	return hashed;
};

function checkIfEmailUniqueError(err: any) {
	try {
		const errorsList = JSON.parse(JSON.stringify(err.errors));
		let isEmailUniqueErr = false;
		errorsList.forEach((err: { validatorKey: string; path: string }) => {
			if (err.validatorKey === 'not_unique') {
				if (err.path === 'email') {
					isEmailUniqueErr = true;
				}
			}
		});
		return isEmailUniqueErr;
	} catch (err) {
		console.error('Error parsing error object:', err);
		return false;
	}
}

export const makeDefaultInternalUsers = async (tx: PostgresJsDatabase) => {
	const createdInternalUsers = [];
	for (const defaultInternalUser of defaultInternalUsers) {
		const createdInternalUser = await storeInternalUser({
			name: defaultInternalUser.name,
			email: defaultInternalUser.email,
			role: 'admin',
			password: defaultInternalUser.password,
			db: tx
		});
		createdInternalUsers.push(createdInternalUser);
	}
	return createdInternalUsers;
};
