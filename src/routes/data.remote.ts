import { getRequestEvent, query } from '$app/server';
import { fetchLandingPageWordsTreeNode } from '$lib/server/words/fetch_landing_page_words_tree/fetch_landing_page_words_tree';
import z from 'zod';

//import uuidValidate from 'uuid-validate';

export const fetchLandingPageWordsTreeNodeRemote = query(z.string(), async (categoryKey) => {
	/*if (!uuidValidate(categoryKey)) {
		const errObj = {
			errorCode: 'INVALID_CATEGORY_KEY_UUID',
			errorMessage: 'The provided category key is not a valid UUID.'
		};
		return Promise.reject(errObj);
	}*/

	const { locals } = getRequestEvent();

	const db = locals.db;

	const landingPageWordsTreeNode = await fetchLandingPageWordsTreeNode({
		db: db,
		categoryKey: categoryKey
	});

	return landingPageWordsTreeNode;
});
