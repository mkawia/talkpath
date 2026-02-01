import dotenv from 'dotenv';
dotenv.config();

const makeDbUrl = () => {
	//DEV_PUSH has to be explicitly set in package.json hence the default is the live
	const isDevPush = process.env.DEV_PUSH ? !!process.env.DEV_PUSH : false;
	//console.log(process.env.DEV_PUSH, isDevPush);

	if (!isDevPush) {
		const dbHostPrefix = 'postgresql://';
		//const dbHostPrefix = 'postgres://';
		const dbHost = process.env.PROD_DB_HOST ? process.env.PROD_DB_HOST : '';
		const dbName = process.env.PROD_DB_DATABASE ? process.env.PROD_DB_DATABASE : '';
		const dbUser = process.env.PROD_DB_USERNAME ? process.env.PROD_DB_USERNAME : '';
		const dbPassword = process.env.PROD_DB_PASSWORD ? process.env.PROD_DB_PASSWORD : '';
		const dbUrl = `${dbHostPrefix}${dbUser}:${dbPassword}@${dbHost}/${dbName}`;

		return dbUrl;
		//return `postgresql://postgres.somegibberish:somepassword@aws-0-us-east-2.pooler.supabase.com:6543/postgres`;
	} else {
		const dbName = process.env.DEV_DB_DATABASE ? process.env.DEV_DB_DATABASE : '';
		const dbUser = process.env.DEV_DB_USERNAME ? process.env.DEV_DB_USERNAME : '';
		const dbPassword = process.env.DEV_DB_PASSWORD ? process.env.DEV_DB_PASSWORD : '';
		const dbUrl = `postgres://${dbUser}:${dbPassword}@localhost:5432/${dbName}`;
		return dbUrl;
	}
};

const dbUrl = makeDbUrl();

export default dbUrl;
