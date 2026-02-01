import postgres from 'postgres';

import dbUrl from '../config/db_url';

//
const emptyDb = async () => {
	const sql = postgres(dbUrl, {
		max: 1,
		idle_timeout: 1000,
		onnotice: (notice) => {
			if (notice.severity !== 'NOTICE') {
				console.log('Notice:', notice);
			}
		}
	});

	//https://stackoverflow.com/questions/3327312/how-can-i-drop-all-the-tables-in-a-postgresql-database
	const dropTablesSql = `
  DO $$ DECLARE
    r RECORD;
  BEGIN
    -- if the schema you operate on is not "current", you will want to
    -- replace current_schema() in query with 'schematodeletetablesfrom'
    -- *and* update the generate 'DROP...' accordingly.
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
  END $$;
  `;

	await sql.unsafe(dropTablesSql);
};

emptyDb()
	.then(() => {
		console.log('Database emptied successfully');
		process.exit(0);
	})
	.catch((err) => {
		console.error('Error emptying database');
		console.error(err);
		process.exit(0);
	});
