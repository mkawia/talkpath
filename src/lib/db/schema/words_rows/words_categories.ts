import { pgTable, uuid, boolean, foreignKey, numeric } from 'drizzle-orm/pg-core';
import { moreFieldsColumn, schemaTimestampsColumns } from '../columns.helpers';
import { text } from 'drizzle-orm/pg-core';
import { InternalUser } from '../internal_users/internal_users';

/**
 * Represents the schema for the `words_categories` table.
 *
 * A "category" here is a high-level grouping for words_rows eg people, dictionary, places,
 *
 * Columns:
 * - `key`: Primary key for the category.
 * - `name`: The name of the category. (Required)
 * - `description`: Longer explanation or usage notes. (Required)
 * - `createdBy`: References the internal user who created this category. (Required)
 * - `isActive`: Whether this category is active/visible in the system. (Required, defaults to true)
 * - `moreFields`: Additional JSON metadata.
 * - `schemaTimestampsColumns`: Created at / updated at timestamps.
 *
 * Foreign Keys:
 * - `createdBy` references `InternalUser.key`.
 */
export const WordCategory = pgTable(
	'words_categories',
	{
		key: uuid('key').primaryKey().notNull(),
		name: text('name').unique().notNull(),
		description: text('description'),
		createdBy: uuid('created_by').notNull(),
		ranking: numeric('ranking', { mode: 'number' }).notNull().default(0),
		isActive: boolean('is_active').notNull().default(true),
		moreFields: moreFieldsColumn,
		...schemaTimestampsColumns
	},
	(table) => {
		return [
			foreignKey({
				columns: [table.createdBy],
				foreignColumns: [InternalUser.key],
				name: 'words_categories_created_by_fkey'
			})
		];
	}
);
