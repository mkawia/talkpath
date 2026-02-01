import { timestamp, jsonb } from 'drizzle-orm/pg-core';

export const schemaTimestampsColumns = {
	updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true, mode: 'string' })
		.defaultNow()
		.notNull(),
	createdAt: timestamp('created_at', { precision: 6, withTimezone: true, mode: 'string' })
		.defaultNow()
		.notNull()
};

/*

	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),

*/

export const moreFieldsColumn = jsonb('more_fields').$type<unknown | undefined>().default(null);
