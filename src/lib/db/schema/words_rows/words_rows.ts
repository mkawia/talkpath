import { pgTable, uuid, boolean, foreignKey } from 'drizzle-orm/pg-core';
import { moreFieldsColumn, schemaTimestampsColumns } from '../columns.helpers';
import { text } from 'drizzle-orm/pg-core';
import { InternalUser } from '../internal_users/internal_users';

/**
 * Represents the schema for the `words_rows` table.
 *
 * A "word" here is any text a user can tap to help form a sentence
 * (e.g., things, locations, people, feelings, actions, etc.).
 *
 * Columns:
 * - `key`: Primary key for the word.
 * - `text`: The main word or phrase displayed to the user. (Required)
 * - `description`: Longer explanation or usage notes. (Required)
 * - `createdBy`: References the internal user who created this word. (Required)
 * - `isActive`: Whether this word is active/visible in the system. (Required, defaults to true)
 * - `moreFields`: Additional JSON metadata.
 * - `schemaTimestampsColumns`: Created at / updated at timestamps.
 *
 * Foreign Keys:
 * - `createdBy` references `InternalUser.key`.
 */
export const WordRow = pgTable(
	'words_rows',
	{
		key: uuid('key').primaryKey().notNull(),
		text: text('text').unique().notNull(),
		description: text('description').notNull(),
		createdBy: uuid('created_by').notNull(),
		isActive: boolean('is_active').notNull().default(true),
		moreFields: moreFieldsColumn,
		...schemaTimestampsColumns
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.createdBy],
				foreignColumns: [InternalUser.key],
				name: 'words_rows_created_by_fkey'
			})
		];
	}
);
