const doGet = async (getUrl: string) => {
	const res = await fetch(getUrl, {
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		method: 'GET'
	});
	const resJson = await resWrangling(res);
	return resJson;
};

const resWrangling = async (res: Response) => {
	const cloneRes = res.clone();
	if (res.ok) {
		try {
			const json = await res.json();
			return json;
		} catch (okErr) {
			const text = await cloneRes.text();
			return Promise.reject({
				message: 'Invalid response, not json',
				res: text,
				okErr: okErr
			});
		}
	} else {
		if (res.status === 404) {
			return Promise.reject({
				message: '404',
				res: 'Path Not found'
			});
		}
		try {
			const json = await res.json();
			return Promise.reject({
				message: 'Unknown error',
				res: json
			});
		} catch (notOkJsonErr) {
			const txt = await cloneRes.text();
			return Promise.reject({
				message: 'Internal error',
				res: txt,
				notOkJsonErr: notOkJsonErr
			});
		}
	}
};

export default doGet;
