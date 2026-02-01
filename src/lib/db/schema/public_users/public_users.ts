import { pgTable, text, varchar, uuid, boolean } from 'drizzle-orm/pg-core';
import { moreFieldsColumn, schemaTimestampsColumns } from '../columns.helpers';

export const PublicUser = pgTable('public_users', {
	key: uuid('key').primaryKey().notNull(),
	fullName: text('name').notNull(),
	email: varchar('email', { length: 256 }).unique().notNull(),
	hash: varchar('hash', { length: 256 }).notNull(),
	isActive: boolean('is_active').notNull(),
	//aux stuff
	moreFields: moreFieldsColumn,
	...schemaTimestampsColumns
});
