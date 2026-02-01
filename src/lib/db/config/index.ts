import type { Config } from 'drizzle-kit';

import dbUrl from './db_url';

//console.log(dbUrl);
//console.log('db ur ====l ==', dbUrl);

const dbConfig: Config = {
	schema: './src/lib/db/schema',
	out: './src/lib/db/schema_out',
	dialect: 'postgresql',
	dbCredentials: {
		url: dbUrl
	},
	verbose: false
} satisfies Config;

export default dbConfig;
