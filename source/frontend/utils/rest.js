import error from '../errors/http';

export async function get(endpoint) {
	let fetchResult = await fetch(endpoint);

	if (!fetchResult.ok) {
		throw new error(fetchResult.status, fetchResult.statusText);
	}

	let result = await fetchResult.json();
	return result;
}
