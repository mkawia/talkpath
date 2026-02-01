import { pgTable, uuid, timestamp, boolean, foreignKey } from 'drizzle-orm/pg-core';
import { moreFieldsColumn, schemaTimestampsColumns } from '../columns.helpers';
import { PublicUser } from './public_users';

/**
 * Represents the schema for the `logins_rows` table.
 *
 * This table stores information about user login sessions, including their
 * expiration, activity status, and last seen timestamp. It also tracks metadata
 * such as auxiliary fields and timestamps for creation and updates.
 *
 * Columns:
 * - `key`: A unique identifier for the login session. (Primary Key)
 * - `publicUser`: A reference to the public user associated with the login session. (Foreign Key)
 * - `isActive`: Indicates whether the login session is active. (Required)
 * - `expiresAt`: The expiration timestamp of the login session. (Required)
 * - `lastSeenAt`: The last seen timestamp of the user in the session. (Required)
 * - `moreFields`: Additional fields for extensibility.
 * - `schemaTimestampsColumns`: Timestamps for tracking creation and updates.
 *
 * Foreign Keys:
 * - `publicUser` references `PublicUser.key`:
 *   Ensures that each login session is associated with a valid public user.
 *
 * Constraints:
 * - `logins_rows_public_user_fkey`: Enforces the relationship between `publicUser` and `PublicUser.key`.
 */
export const LoginRow = pgTable(
	'logins_rows',
	{
		key: uuid('key').primaryKey().notNull(),
		publicUser: uuid('public_user').notNull(),
		isActive: boolean('is_active').notNull().default(true),
		expiresAt: timestamp('expires_at', {
			precision: 6,
			withTimezone: true,
			mode: 'string'
		}).notNull(),
		lastSeenAt: timestamp('last_seen_at', {
			precision: 6,
			withTimezone: true,
			mode: 'string'
		}).notNull(),
		// aux stuff
		moreFields: moreFieldsColumn,
		...schemaTimestampsColumns
	},
	(table) => {
		return [
			// publicUser foreign key
			foreignKey({
				columns: [table.publicUser],
				foreignColumns: [PublicUser.key],
				name: 'logins_rows_public_user_fkey'
			})
		];
	}
);
