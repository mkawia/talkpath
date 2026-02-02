import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { storeNewWordCategories, storeNewWords } from '../../words_fns';
import { categoriesDescriptions, peopleAndStuffObject } from './people_and_stuff';

export const insertDefaultPeopleAndStuff = async (params: {
	tx: PostgresJsDatabase;
	createdBy: string;
}) => {
	const { tx, createdBy } = params;

	//first make category
	const categoriesSets = new Set<string>();
	for (const dictionaryObj of Object.entries(peopleAndStuffObject)) {
		categoriesSets.add(dictionaryObj[1].category);
	}

	const categoriesParams = Array.from(categoriesSets).map((category) => {
		const existingCategory = categoriesDescriptions.find((catDesc) => catDesc.text === category);
		if (!existingCategory) {
			console.warn(`No description found for category: ${category}. Using empty description.`);
		}
		return {
			text: category,
			description: existingCategory ? existingCategory.description : ''
		};
	});

	//first store the category
	const newCategories = await storeNewWordCategories({
		categories: categoriesParams,
		createdBy: createdBy,
		db: tx
	});

	//some paranoid check,
	if (newCategories.length === 0) {
		const errObj = {
			newCategoriesLength: newCategories.length,
			errorCode: 'FAILED_TO_CREATE_PEOPLE_AND_STUFF_CATEGORIES_MISMATCH',
			errorMessage: 'Expected to create at least one People and Stuff categories'
		};
		return Promise.reject(errObj);
	}

	const insertPeopleAndStuffParamsSegments: {
		words: { text: string; description: string }[];
		categoryKey: string;
	}[] = [];
	for (const newCategory of newCategories) {
		const thisCategoryWordsParams: { text: string; description: string }[] = [];
		for (const dictionaryObj of Object.entries(peopleAndStuffObject)) {
			if (dictionaryObj[1].category === newCategory.name) {
				thisCategoryWordsParams.push({
					text: dictionaryObj[1].name,
					description: dictionaryObj[1].description
				});
			}
		}
		//add it in segments
		insertPeopleAndStuffParamsSegments.push({
			words: thisCategoryWordsParams,
			categoryKey: newCategory.key
		});
	}

	//now for actual insertion
	let allReturnObjects: {
		key: string;
		description: string;
		createdBy: string | null;
		isActive: boolean;
		moreFields: unknown;
		updatedAt: string;
		createdAt: string;
		text: string;
	}[] = [];

	for (const insertPeopleAndStuffParamsSegment of insertPeopleAndStuffParamsSegments) {
		const returnObjects = await storeNewWords({
			words: insertPeopleAndStuffParamsSegment.words,
			createdBy: createdBy,
			category: insertPeopleAndStuffParamsSegment.categoryKey,
			db: tx
		});

		allReturnObjects = allReturnObjects.concat(returnObjects);
	}

	return allReturnObjects;
};
