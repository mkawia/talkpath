import { WordCategory } from '$lib/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const db = locals.db;

	const wordCategoriesRows = await db
		.select({
			key: WordCategory.key,
			name: WordCategory.name,
			ranking: WordCategory.ranking
		})
		.from(WordCategory);

	return {
		landingPageWordCategories: wordCategoriesRows
	};
};
