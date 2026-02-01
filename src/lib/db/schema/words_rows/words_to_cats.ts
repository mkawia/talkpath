import { pgTable, uuid, foreignKey, primaryKey } from 'drizzle-orm/pg-core';
import { moreFieldsColumn, schemaTimestampsColumns } from '../columns.helpers';
import { InternalUser } from '../internal_users/internal_users';
import { WordRow } from './words_rows';
import { WordCategory } from './words_categories';

export const WordsToCats = pgTable(
	'words_to_cats',
	{
		//the word
		word: uuid('word').notNull(),
		//the category
		category: uuid('category').notNull(),
		//aux stuff
		categorizedBy: uuid('categorized_by').notNull(),
		moreFields: moreFieldsColumn,
		...schemaTimestampsColumns
	},
	(table) => {
		// foreign key
		return [
			//primary key
			primaryKey({ name: 'words_to_cats_pkey', columns: [table.word, table.category] }),

			//the cateorized word
			foreignKey({
				columns: [table.word],
				foreignColumns: [WordRow.key],
				name: 'words_to_cats_word_fkey'
			}),
			// the category foreign key
			foreignKey({
				columns: [table.category],
				foreignColumns: [WordCategory.key],
				name: 'words_to_cats_category_fkey'
			}),
			//categorizedBy foreign key
			foreignKey({
				columns: [table.categorizedBy],
				foreignColumns: [InternalUser.key],
				name: 'words_to_cats_categorized_by_fkey'
			})
		];
	}
);
