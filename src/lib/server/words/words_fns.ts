import { WordCategory, WordRow, WordsToCats } from '$lib/db/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export async function storeNewWords(params: {
	words: { text: string; description: string }[];
	createdBy: string;
	category: string;
	db: PostgresJsDatabase;
}) {
	const { words, createdBy, category, db } = params;

	try {
		const newWordsObjects = words.map((word) => ({
			key: crypto.randomUUID(),
			text: word.text,
			description: word.description,
			createdBy: createdBy
		}));

		//first create word rows
		const createdWordRowsRes = await db
			.insert(WordRow)
			.values(newWordsObjects)
			.returning()
			.execute();

		//first lets compare createdWordRowsRes length to words length
		if (createdWordRowsRes.length !== words.length) {
			const errObj = {
				createdWordRowsResLength: createdWordRowsRes.length,
				wordsLength: words.length,
				errorCode: 'FAILED_TO_CREATE_ALL_WORDS_MISMATCH'
			};
			return Promise.reject(errObj);
		}

		//now categories m2m
		const wordToCatsObjs = createdWordRowsRes.map((wordRow) => ({
			word: wordRow.key,
			category: category,
			categorizedBy: createdBy
		}));

		const createdWordsToCatsRes = await db
			.insert(WordsToCats)
			.values(wordToCatsObjs)
			.returning()
			.execute();

		//compare lengths again
		if (createdWordsToCatsRes.length !== words.length) {
			const errObj = {
				createdWordsToCatsResLength: createdWordsToCatsRes.length,
				wordsLength: words.length,
				errorCode: 'FAILED_TO_CREATE_ALL_WORDS_CATEGORIES_MISMATCH'
			};
			return Promise.reject(errObj);
		}

		return createdWordRowsRes;
	} catch (err) {
		if (checkIfTextUniqueError(err)) {
			return Promise.reject('TEXT_NOT_UNIQUE');
		}
		return Promise.reject(err);
	}
}

export async function storeNewWordCategories(params: {
	categories: { text: string; description: string }[];
	createdBy: string;
	db: PostgresJsDatabase;
}) {
	const { categories, createdBy, db } = params;

	try {
		const newCategoriesObjects = categories.map((category) => ({
			key: crypto.randomUUID(),
			name: category.text,
			description: category.description,
			createdBy: createdBy
		}));

		//first create word rows
		const createdCategoriesRes = await db
			.insert(WordCategory)
			.values(newCategoriesObjects)
			.returning()
			.execute();

		//first lets compare createdCategoriesRes length to categories length
		if (createdCategoriesRes.length !== categories.length) {
			const errObj = {
				createdCategoriesResLength: createdCategoriesRes.length,
				categoriesLength: categories.length,
				errorCode: 'FAILED_TO_CREATE_ALL_CATEGORIES_MISMATCH'
			};
			return Promise.reject(errObj);
		}

		return createdCategoriesRes;
	} catch (err) {
		if (checkIfTextUniqueError(err)) {
			return Promise.reject('TEXT_NOT_UNIQUE');
		}
		return Promise.reject(err);
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkIfTextUniqueError(err: any) {
	try {
		const errorsList = JSON.parse(JSON.stringify(err.errors));
		let isTextUniqueErr = false;
		errorsList.forEach((err: { validatorKey: string; path: string }) => {
			if (err.validatorKey === 'not_unique') {
				if (err.path === 'text') {
					isTextUniqueErr = true;
				}
			}
		});
		return isTextUniqueErr;
	} catch (err) {
		console.error('Error parsing error object:', err);
		return false;
	}
}
