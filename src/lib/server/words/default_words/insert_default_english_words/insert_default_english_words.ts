import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

//this is based on https://github.com/matthewreagan/WebstersEnglishDictionary
//import from ./english_words.json' as raw

import englishWordsRaw from './english_words.json' assert { type: 'json' };

import { storeNewWordCategories, storeNewWords } from '../../words_fns';

const englishWordsCategoryName = 'English words';
const englishWordsCategoryDescription = 'Common English words with their meanings';
const englishWordsInsertSegmentSize = 500;
export const insertDefaultEnglishWords = async (params: {
	tx: PostgresJsDatabase;
	createdBy: string;
}) => {
	const { tx, createdBy } = params;

	//first store the category
	const newCategories = await storeNewWordCategories({
		categories: [{ text: englishWordsCategoryName, description: englishWordsCategoryDescription }],
		createdBy: createdBy,
		db: tx
	});

	//some paranoid check, make sure newCategories.length === 1
	if (newCategories.length !== 1) {
		const errObj = {
			newCategoriesLength: newCategories.length,
			errorCode: 'FAILED_TO_CREATE_ENGLISH_WORDS_CATEGORY_MISMATCH',
			errorMessage: 'Expected to create exactly one English words category'
		};
		return Promise.reject(errObj);
	}

	const englishCategoryKey = newCategories[0].key;

	/* now for the actual words */

	//this is a record ie {"word":"meaning","word2":"meaning2"}

	/*
	 eg
	 
	 {
  "0": {
    "word": "anopheles",
    "meaning": "A genus of mosquitoes which are secondary hosts of the malaria parasites, and whose bite is the usual, if not the only, means of infecting human beings with malaria. Several species are found in the United States. They may be distinguished from the ordinary mosquitoes of the genus Culex by the long slender palpi, nearly equaling the beak in length, while those of the female Culex are very short. They also assume different positions when resting, Culex usually holding the body parallel to the surface on which it rests and keeping the head and beak bent at an angle, while Anopheles holds the body at an angle with the surface and the head and beak in line with it. Unless they become themselves infected by previously biting a subject affected with malaria, the insects cannot transmit the disease."
  },
  "1": {
    "word": "uniclinal",
    "meaning": "See Nonoclinal."
  },
  }

	*/

	const englishWordsParsed = englishWordsRaw as Record<
		string,
		{
			word: string;
			meaning: string;
		}
	>;

	const insertWordsParamsAll: { text: string; description: string }[] = [];
	for (const dictionaryObj of Object.entries(englishWordsParsed)) {
		insertWordsParamsAll.push({
			text: dictionaryObj[1].word,
			description: dictionaryObj[1].meaning
		});
	}

	//now to segment it by englishWordsInsertSegmentSize
	const insertWordsParamsSegments: { text: string; description: string }[][] = [];
	for (let i = 0; i < insertWordsParamsAll.length; i += englishWordsInsertSegmentSize) {
		const segment = insertWordsParamsAll.slice(i, i + englishWordsInsertSegmentSize);
		insertWordsParamsSegments.push(segment);
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

	for (const insertWordsParamsSegment of insertWordsParamsSegments) {
		const returnObjects = await storeNewWords({
			words: insertWordsParamsSegment,
			createdBy: createdBy,
			category: englishCategoryKey,
			db: tx
		});

		allReturnObjects = allReturnObjects.concat(returnObjects);
	}

	return allReturnObjects;
};
