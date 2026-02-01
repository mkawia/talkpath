import { internalUserZeroEmail } from '$lib/server/internal_users/default_internal_users';
import { makeDefaultInternalUsers } from '$lib/server/internal_users/utils';
import db from '..';

const doSeed = async () => {
	//start a transaction
	await db.transaction(async (tx) => {
		const createdInternalUsers = await makeDefaultInternalUsers(tx);
		const internalUserZeroKey = getInternalUserZeroKey(createdInternalUsers);
		if (!internalUserZeroKey) {
			throw new Error(
				`Internal error: creater internal users, user zero ${internalUserZeroEmail} not found`
			);
		}
		console.log(`Successfully seeded internal users ${createdInternalUsers.length}`);
	});

	console.log('Successfully seeded database');
};

const getInternalUserZeroKey = (createdInternalUsers: { key: string; email: string }[]) => {
	for (const createdInternalUser of createdInternalUsers) {
		if (createdInternalUser.email === internalUserZeroEmail) {
			return createdInternalUser.key;
		}
	}
	return null;
};

doSeed()
	.then(() => {
		console.log('Database seeded successfully');
		process.exit(0);
	})
	.catch((err) => {
		console.error('Error seeding database');
		console.error(err);
		process.exit(0);
	});
