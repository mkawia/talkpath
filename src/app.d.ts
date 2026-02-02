// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: import('drizzle-orm/postgres-js').PostgresJsDatabase;
			publicUserLogin: import('$lib/server/public_users/utils').PublicUserLogin | null;
			internalUserLogin: import('$lib/server/internal_users/constants').InternalUserLogin | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
