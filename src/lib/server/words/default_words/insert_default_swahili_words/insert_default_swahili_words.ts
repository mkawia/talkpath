import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

//this is based on https://github.com/Kalebu/kamusi
import swahiliWordsRaw from './swahili_words.json';
import { storeNewWordCategories, storeNewWords } from '../../words_fns';

const swahiliWordsCategoryName = 'Swahili words';
const swahiliWordsCategoryDescription = 'Common Swahili words with their meanings';
const swahiliWordsInsertSegmentSize = 500;
export const insertDefaultSwahiliWords = async (params: {
	tx: PostgresJsDatabase;
	createdBy: string;
}) => {
	const { tx, createdBy } = params;

	//first store the category
	const newCategories = await storeNewWordCategories({
		categories: [{ text: swahiliWordsCategoryName, description: swahiliWordsCategoryDescription }],
		createdBy: createdBy,
		db: tx
	});

	//some paranid check, make sure newCategories.length === 1
	if (newCategories.length !== 1) {
		const errObj = {
			newCategoriesLength: newCategories.length,
			errorCode: 'FAILED_TO_CREATE_SWAHILI_WORDS_CATEGORY_MISMATCH',
			errorMessage: 'Expected to create exactly one Swahili words category'
		};
		return Promise.reject(errObj);
	}

	const swahiliCategoryKey = newCategories[0].key;

	/* now for the actual words */

	//this is a record ie {"word":"meaning","word2":"meaning2"}

	const swahiliWordsParsed: Record<string, string> = swahiliWordsRaw;

	const insertWordsParamsAll: { text: string; description: string }[] = [];
	for (const [word, meaning] of Object.entries(swahiliWordsParsed)) {
		insertWordsParamsAll.push({ text: word, description: meaning });
	}

	//now to segment it by swahiliWordsInsertSegmentSize
	const insertWordsParamsSegments: { text: string; description: string }[][] = [];
	for (let i = 0; i < insertWordsParamsAll.length; i += swahiliWordsInsertSegmentSize) {
		const segment = insertWordsParamsAll.slice(i, i + swahiliWordsInsertSegmentSize);
		insertWordsParamsSegments.push(segment);
	}

	//now for actual insertation
	let allReturnObjects: {
		key: string;
		description: string;
		createdBy: string;
		isActive: boolean;
		moreFields: unknown;
		updatedAt: string;
		createdAt: string;
		text: string;
	}[] = [];

	for (const insertWordsParamsSegment of insertWordsParamsSegments) {
		const returnObjects = await storeNewWords({
			words: insertWordsParamsSegment,
			createdBy: createdBy,
			category: swahiliCategoryKey,
			db: tx
		});

		allReturnObjects = allReturnObjects.concat(returnObjects);
	}

	return allReturnObjects;
};
