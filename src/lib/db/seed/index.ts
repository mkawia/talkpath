import { internalUserZeroEmail } from '$lib/server/internal_users/default_internal_users';
import { makeDefaultInternalUsers } from '$lib/server/internal_users/utils';
import { insertDefaultEnglishWords } from '$lib/server/words/default_words/insert_default_english_words/insert_default_english_words';
import { insertDefaultPeopleAndStuff } from '$lib/server/words/default_words/insert_default_people_stuff/insert_default_people_stuff';
import { insertDefaultSwahiliWords } from '$lib/server/words/default_words/insert_default_swahili_words/insert_default_swahili_words';
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

		//now insert default swahili words
		const returnSwahiliWords = await insertDefaultSwahiliWords({
			tx: tx,
			createdBy: internalUserZeroKey
		});
		console.log(`Successfully seeded default ${returnSwahiliWords.length} swahili words`);

		//now insert default english words
		const returnEnglishWords = await insertDefaultEnglishWords({
			tx: tx,
			createdBy: internalUserZeroKey
		});
		console.log(`Successfully seeded default ${returnEnglishWords.length} english words`);

		//now insert default people and stuff
		//TODO: get this to 500, the manually written stuff
		const returnPeopleAndStuff = await insertDefaultPeopleAndStuff({
			tx: tx,
			createdBy: internalUserZeroKey
		});
		console.log(`Successfully seeded default ${returnPeopleAndStuff.length} people and stuff`);
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
