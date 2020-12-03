import { useState } from 'react';

export default function usePost(endpoint) {
	let [pending, setPending] = useState(false);

	async function execute(body) {
		setPending(true);
		let fetchResult = await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json',
			},
		});
		setPending(false);

		if (!fetchResult.ok) {
			throw new Error(fetchResult.statusText);
		}

		let result = await fetchResult.json();
		return result;
	}

	return [execute, pending];
}