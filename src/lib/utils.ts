import { stringify as devalueStringify } from 'devalue';

export const JSONStringifyIt = (input: unknown) => {
	// Helper function to parse stringified JSON
	/*const tryParse = (value: unknown) => {
		if (typeof value === 'string') {
			try {
				return JSON.parse(value);
			} catch {
				return value;
			}
		}
		return value;
	};*/

	// Recursive function to handle nested parsing
	const recursiveParse = (value: unknown): unknown => {
		if (typeof value === 'string') {
			try {
				const parsed = JSON.parse(value);
				return recursiveParse(parsed);
			} catch {
				return value;
			}
		}
		if (typeof value === 'object' && value !== null) {
			for (const [key, val] of Object.entries(value)) {
				//@ts-expect-error only way to make sure Im making the accounting for error
				value[key] = recursiveParse(val);
			}
		}
		return value;
	};

	// Check if it's an error
	if (input instanceof Error) {
		return JSON.stringify({
			error: {
				message: input.message,
				cause: input.cause,
				name: input.name,
				stack: input.stack
			},
			errObj: input
		});
	}

	if (typeof input === 'string') {
		return input;
	}

	if (typeof input === 'object' && input !== null) {
		const parsedObject: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(input)) {
			try {
				const parsedValue = recursiveParse(value);
				if (parsedValue instanceof Error) {
					parsedObject[key] = JSON.stringify({
						error: {
							message: parsedValue.message,
							cause: parsedValue.cause,
							name: parsedValue.name,
							stack: parsedValue.stack
						},
						errObj: parsedValue
					});
				} else {
					parsedObject[key] = parsedValue;
				}
			} catch {
				parsedObject[key] = value;
			}
		}
		return JSON.stringify(parsedObject);
	}

	return JSON.stringify(input);
};

export const stringifyIt = (input: unknown) => {
	//TODO check if it's an error
	//https://www.npmjs.com/package/@stdlib/error-to-json

	//err check
	/*if (input.message) {
		//@ts-expect-error only way to make sure Im making the accounting for error
		const errStr: string = input.message;
		return errStr + '';
	}*/

	if (input instanceof Error) {
		const objError = errorObjectifier(input);
		if (objError) {
			return JSON.stringify(objError);
		}
		if (input.name === 'SequelizeUniqueConstraintError') {
			//stringify .errors
			//console.log(Array.isArray(input.errors));
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			return JSON.stringify({ error: input.errors, ogError: input });
		}
		if (input.name === 'SequelizeDatabaseError') {
			//stringify .errors
			//console.log(Array.isArray(input.errors));
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			return JSON.stringify({ sql: input.sql, sqlErrorName: input.name, ogError: input });
		}
		return input.name + ' - ' + input.message;
	}

	//check if is string already
	if (typeof input === 'string') {
		return input;
	}
	if (input instanceof String) {
		return input.toString();
	}

	try {
		if (input instanceof Object) {
			if (input.constructor.name === 'Object' || input.constructor.name === 'Array') {
				const toReturn = JSON.stringify({ error: input, ogError: input });
				//console.log(typeof toReturn);
				return toReturn;
			}
		}

		//console.log(input);
		return devalueStringify(input);
	} catch (err) {
		const errStringied = devalueStringify(err);
		return input + '' + errStringied;
	}
};

//causes those weird buffer.Buffer errors that I hate
//import error2json from '@stdlib/error-to-json';

export const errorObjectifier = (input: unknown) => {
	if (input instanceof Error) {
		const objError = input.message;
		//count the number of keys
		const objKeys = Object.keys(objError);
		if (objKeys.length === 1) {
			return objError;
		}
	}
	//if string
	if (typeof input === 'string') {
		return input;
	}
	//try  JSON.stringify
	const jsonString = JSON.stringify(input);
	//check if it's failed
	const failedJSONstring = jsonStringifyHasFailed(jsonString);
	if (!failedJSONstring) {
		return jsonString;
	}

	//return the string
	return input;
};

const jsonStringifyHasFailed = (input: string) => {
	//if not a string
	if (typeof input !== 'string') {
		return true;
	}

	//if '{}'
	if (input === '{}') {
		return true;
	}
	//if 'null'
	if (input === 'null') {
		return true;
	}
	//if 'undefined'
	if (input === 'undefined') {
		return true;
	}
	//if '[]'
	if (input === '[]') {
		return true;
	}
	//if '""'
	if (input === '""') {
		return true;
	}
	//if ''''
	if (input === "''") {
		return true;
	}
	//SyntaxError or Unexpected token
	if (input.includes('SyntaxError') || input.includes('Unexpected token')) {
		return true;
	}
	//if TypeError
	if (input.includes('TypeError')) {
		return true;
	}
	//can't be serialized
	if (
		input.includes('circular') ||
		input.includes("can't be serialized") ||
		input.includes('cyclic') ||
		input.includes('Circular')
	) {
		return true;
	}

	//[[]]
	if (input.includes('[[]]')) {
		return true;
	}

	return false;
};

export const humanDate = (input: string | Date) => {
	const dateObj = typeof input === 'string' ? new Date(input) : input;
	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	const month = monthNames[dateObj.getMonth()];
	const day = String(dateObj.getDate()); //.padStart(2, '0');
	const year = dateObj.getFullYear();
	const output = month + '\n' + day + ' ' + year;

	return output;
};

export const timeSince = (date_str: string | Date) => {
	const date = new Date(date_str);

	const leo = new Date();
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const seconds = Math.floor((leo - date) / 1000);

	let interval = seconds / 31536000;

	if (interval > 1) {
		//	return Math.floor(interval) + " years";
		return humanDate(date);
	}
	// return globalThis.humanDate(date)

	interval = seconds / 2592000;
	if (interval > 1) {
		//	return Math.floor(interval) + " months";
		return humanDate(date);
	}
	interval = seconds / 86400;
	if (interval > 1) {
		//	return Math.floor(interval) + " days";
		if (interval < 2) {
			return 'Yesterday';
		}
		return humanDate(date);
	}

	//else seconds
	interval = seconds / 3600;
	if (interval > 1) {
		const floored = Math.floor(interval);
		if (floored == 1) {
			return '1 hour ago';
		}
		return floored + ' hours ago';
	}
	interval = seconds / 60;
	if (interval > 1) {
		return Math.floor(interval) + ' mins ago';
	}

	//return Math.floor(seconds) + " seconds";
	return 'Now';
};

export const isValidEmailZod = (emailInput: string) => {
	//const emailCheck = z.coerce.string().email().min(5);
	const emailCheck = z.email();
	const emailCheckResults = emailCheck.safeParse(emailInput);
	return emailCheckResults.success;
};

export const smoothScrollTo = (elId: string) => {
	if (!browser) {
		return;
	}
	const elToScrollTo = document.getElementById(elId);
	console.log(elToScrollTo);
	if (!elToScrollTo) {
		return;
	}

	//some element have  offsetTop zero for some reason
	if (elToScrollTo.offsetTop === 0) {
		//scroll just above the element
		elToScrollTo.scrollIntoView({ behavior: 'smooth', block: 'start' });
		//then scroll a 30px above the current scroll position,smoothly
		/*	setTimeout(() => {
			window.scrollBy(0, -40);
		}, 500);*/

		return;
	}
	//scroll just above the element
	const elToScrollToTop = elToScrollTo.offsetTop - 30;

	window.scrollTo({
		top: elToScrollToTop,
		behavior: 'smooth'
	});
};
export const makeFullNameInitials = (input: string) => {
	try {
		if (!input) {
			return 'AA';
		}
		if (typeof input !== 'string') {
			return 'AA';
		}
		if (input.length === 2) {
			return input.toUpperCase();
		}
		let initials = 'AA';
		const parts = input.split(' ');
		if (parts.length === 1) {
			const firstLetter = parts[0][0];
			return firstLetter.toUpperCase();
		}
		if (parts.length === 2) {
			const firstPart = parts[0];
			const secondPart = parts[1];
			initials = firstPart[0] + secondPart[0];
		}
		if (parts.length > 2) {
			const firstPart = parts[0];
			const lastPart = parts[parts.length - 1];
			const firstLetter = firstPart[0];
			const lastLetter = lastPart[0];
			initials = firstLetter + lastLetter;
		}
		//just making sure because it one show MUDEFINIED
		if (initials.length == 2) {
			return initials.toUpperCase();
		}
		return 'AA';
	} catch (_err) {
		console.error(_err);
		return 'AA';
	}
};

export const humanTime = (value: string | Date) => {
	let date: Date = new Date(value);
	if (typeof value === 'string') {
		date = new Date(value);
	} else {
		date = value;
	}

	const hours = date.getHours();
	const minutes = date.getMinutes();

	const minStr = minutes < 10 ? '0' + minutes : minutes;
	const strTime = hours + ':' + minStr;

	let dateStr = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();

	const leo = new Date();
	if (date.setHours(0, 0, 0, 0) == leo.setHours(0, 0, 0, 0)) {
		dateStr = 'Today';
	}
	return dateStr + '  ' + strTime;
};

export const assertDateToIsoString = (input: unknown) => {
	if (input instanceof Date) {
		return input.toISOString();
	}
	if (typeof input === 'string') {
		return input;
	}
	if (input instanceof String) {
		return input.toString();
	}
	return input + '';
};

export const makeLoginContinueUrl = (params: {
	url: URL;
	forInternalLogin?: true;
	//whatever thing that called this can use to reconstruct the url
	reference?: string;
}) => {
	const { url, forInternalLogin = false, reference } = params;
	//get pathname
	const continueUrl = url.pathname;
	const continueSearchParams = new URLSearchParams(`?continue=${continueUrl}`);

	//if reference is provided, add it to the search params
	if (reference) {
		continueSearchParams.append('reference', reference);
	}

	//sending params separately for login to reconstruct the url
	const continueUrlSearch = url.search.replace('?', '');
	if (continueUrlSearch) {
		continueSearchParams.append('continue_search', continueUrlSearch);
	}
	if (forInternalLogin) {
		return `/internal-login?${continueSearchParams.toString()}`;
	} else {
		return `/login?${continueSearchParams.toString()}`;
	}
};

//TODO maybe use locale string?
export const formatMoney = (amount: number) => {
	//firsr round to 2 decimal places
	const amountRounded = Math.round(amount * 100) / 100;
	//just add commas
	return amountRounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const generateRandomInt = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

//fetchers
import doGet from './misc_utils/fetchers/fetch_get';
export const fetchGet = doGet;
import doPost from './misc_utils/fetchers/fetch_post';
export const fetchPost = doPost;

import { z } from 'zod';
import { browser } from '$app/environment';
import Decimal from 'decimal.js-light';

export const forgivingDiff = 0.001;

export const castToPostgresNumericOrString = (input: number | string): number => {
	if (typeof input === 'number') {
		return input;
	}

	// Check if the string is a valid number
	if (isNaN(Number(input))) {
		throw new Error('Input string is not a valid number');
	}

	// Parse the string to a Decimal for precise arithmetic
	const decimalInput = new Decimal(input);

	return conditionalRoundOff(decimalInput);
};

export const conditionalRoundOff = (input: number | Decimal, places?: number): number => {
	const precision = places !== undefined ? places : getConditionalPrecision(input);
	const roundedOff =
		typeof input === 'number'
			? new Decimal(input).toDecimalPlaces(precision)
			: input.toDecimalPlaces(precision);
	return roundedOff.toNumber();
};

export const assertAnyToNumber = (input: unknown): number => {
	if (typeof input === 'number') {
		return input;
	}
	if (input instanceof Decimal) {
		return input.toNumber();
	}
	if (typeof input === 'string') {
		if (isNaN(Number(input))) {
			throw new Error('Input string is not a valid number');
		}
		return Number(input);
	}
	throw new Error('Input is not a number');
};

const getConditionalPrecision = (precy: number | Decimal): number => {
	const decimalPrecy = typeof precy === 'number' ? new Decimal(precy) : precy;
	//if less than 0.5
	if (decimalPrecy.lessThan(1)) {
		//0.00000290001
		if (decimalPrecy.lessThan(0.000005)) {
			return 11;
		}
		if (decimalPrecy.lessThan(0.00005)) {
			return 10;
		}
		if (decimalPrecy.lessThan(0.0005)) {
			return 9;
		}
		if (decimalPrecy.lessThan(0.005)) {
			return 8;
		}
		if (decimalPrecy.lessThan(0.05)) {
			return 7;
		}
		//here be dragons
		return 6;
	}
	if (decimalPrecy.lessThan(10)) {
		return 5;
	}
	if (decimalPrecy.lessThan(100)) {
		return 4;
	}
	if (decimalPrecy.lessThan(1000)) {
		return 4;
	}
	return 2;
};

export const tryErrMsg = (err: unknown): string => {
	if (err instanceof Error) {
		return err.message;
	}
	if (typeof err === 'string') {
		return err;
	}
	return stringifyIt(err);
};

//export { addDaysToDate, diffBetweenDays } from './app_utils/dates_fns';

export enum PasswordCheck {
	LENGTH = 'LENGTH',
	UPPERCASE = 'UPPERCASE',
	LOWERCASE = 'LOWERCASE'
}

//8 characters, 1 uppercase, 1 lowercase
export const getPasswordStrength = (input: string) => {
	let score: 0 | 1 | 2 | 3 = 0;

	const failedChecks: PasswordCheck[] = [];

	//test length
	if (input.length >= 8) {
		score++;
	} else {
		failedChecks.push(PasswordCheck.LENGTH);
	}

	//test for uppercase
	if (/[A-Z]/.test(input)) {
		score++;
	} else {
		failedChecks.push(PasswordCheck.UPPERCASE);
	}

	//test for lowercase
	if (/[a-z]/.test(input)) {
		score++;
	} else {
		failedChecks.push(PasswordCheck.LOWERCASE);
	}

	return {
		score: score,
		failedChecks: failedChecks,
		failed: failedChecks.length > 0
	};
};

//30 seconds
export const timeToCheckIfStillThereInMs = 1000 * 30;
