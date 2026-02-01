import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { makePublicUserPasswordHash } from './utils';

import { PublicUser } from '$lib/db/schema';
import { defaultFakePublicUsersUsers } from './default_fake_public_users';

export const addPublicUsers = async (params: {
	tx: PostgresJsDatabase;
	newPublicUsersParams: {
		newPublicUserKey?: string;
		email: string;
		fullname: string;
		password: string;
	}[];
}) => {
	const { tx, newPublicUsersParams } = params;

	const newUsersPayloads = [];
	for (const newPublicUserParams of newPublicUsersParams) {
		const createdHash = await makePublicUserPasswordHash(newPublicUserParams.password);
		newUsersPayloads.push({
			key: newPublicUserParams.newPublicUserKey
				? newPublicUserParams.newPublicUserKey
				: crypto.randomUUID(),
			email: newPublicUserParams.email,
			fullName: newPublicUserParams.fullname,
			hash: createdHash,
			isActive: true
		});
	}

	const createdUsers = await tx.insert(PublicUser).values(newUsersPayloads).returning().execute();

	return createdUsers;
};

export const makeDefaultFakePublicUsersUsers = async (tx: PostgresJsDatabase) => {
	const defaultPublicUsers = await addPublicUsers({
		tx,
		newPublicUsersParams: defaultFakePublicUsersUsers
	});
	return defaultPublicUsers;
};
