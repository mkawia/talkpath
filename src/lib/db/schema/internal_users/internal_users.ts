//import { sql } from 'drizzle-orm';
import { pgTable, text, varchar, pgEnum, uuid, boolean } from 'drizzle-orm/pg-core';
import { moreFieldsColumn, schemaTimestampsColumns } from '../columns.helpers';

export const internalUserRole = pgEnum('role', ['admin', 'mod']);

export const InternalUser = pgTable('internal_users', {
	key: uuid('key').primaryKey().notNull(),
	name: text('name').unique().notNull(),
	email: varchar('email', { length: 256 }).unique().notNull(),
	hash: varchar('hash', { length: 256 }).notNull(),
	role: internalUserRole('role').notNull(),
	isActive: boolean('is_active').notNull().default(true),
	avatarUrl: varchar('avatar_url', { length: 256 }),
	activeLogin: uuid('active_login'),
	activeLoginExpires: varchar('active_login_expired'),
	//aux stuff
	moreFields: moreFieldsColumn,
	...schemaTimestampsColumns
});
