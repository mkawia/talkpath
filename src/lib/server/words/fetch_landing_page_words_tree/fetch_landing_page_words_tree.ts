import { WordCategory, WordRow, WordsToCats } from '$lib/db/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import { stringifyIt } from '$lib/utils';

export type LandingWordsTreeNode = {
	categoryKey: string;
	categoryName: string;
	ranking: number;
	words: {
		key: string;
		text: string;
	}[];
};

export const fetchLandingPageWordsTreeNode = async (params: {
	db: PostgresJsDatabase;
	categoryKey: string;
}): Promise<LandingWordsTreeNode | null> => {
	const { db, categoryKey } = params;

	let categoriesRows: {
		key: string;
		name: string;
		ranking: number;
	}[];

	let wordsForCategory: {
		key: string;
		text: string;
	}[];

	try {
		// Fetch the category and its associated words
		[categoriesRows, wordsForCategory] = await Promise.all([
			db
				.select({
					key: WordCategory.key,
					name: WordCategory.name,
					ranking: WordCategory.ranking
				})
				.from(WordCategory)
				//no need to check if active we trust whoever is calling this function
				//.where(and(eq(WordCategory.key, categoryKey), eq(WordCategory.isActive, true)))
				.where(eq(WordCategory.key, categoryKey))
				.limit(1),

			db
				.select({
					key: WordRow.key,
					text: WordRow.text
				})
				.from(WordRow)
				.innerJoin(WordsToCats, eq(WordRow.key, WordsToCats.word))
				.where(and(eq(WordsToCats.category, categoryKey), eq(WordRow.isActive, true)))
		]);
	} catch (dbSelectErr) {
		console.log(dbSelectErr);
		const errObj = {
			message: 'Database select error in fetchLandingPageWordsTreeNode',
			details: dbSelectErr,
			errString: stringifyIt(dbSelectErr)
		};

		console.error('fetchLandingPageWordsTreeNode error:', errObj);
		throw new Error('Database select error in fetchLandingPageWordsTreeNode');
	}

	// some paranoid check, check if length is exactly 1
	if (categoriesRows.length !== 1) {
		//if zero ok
		if (categoriesRows.length === 0) {
			return null;
		}
		//if more than 1 something is very wrong, here be dragons
		const errObj = {
			message: 'Data integrity error: multiple categories found with the same key',
			categoryKey,
			categoriesFound: categoriesRows.length
		};
		console.error('fetchLandingPageWordsTreeNode error:', errObj);
		return Promise.reject(errObj);
	}

	const category = categoriesRows[0];

	// Construct and return the LandingWordsTreeNode
	return {
		categoryKey: category.key,
		categoryName: category.name,
		ranking: category.ranking,
		words: wordsForCategory
	};
};
