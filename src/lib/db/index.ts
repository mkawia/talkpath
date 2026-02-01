import dbUrl from './config/db_url';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const dbClient = postgres(dbUrl, {
	onnotice: (notice) => {
		if (notice.severity !== 'NOTICE') {
			console.log('Notice:', notice);
		}
	}
});

const db: PostgresJsDatabase = drizzle(dbClient);

export default db;
