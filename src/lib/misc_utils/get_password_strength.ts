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
