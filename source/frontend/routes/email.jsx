import React from 'react';
import Email from '../pages/email';

import { useLocation } from 'react-sprout';

function parseQuery(query) {
	let result = {};
	for (let [key, value] of new URLSearchParams(query)) {
		result[key] = value;
	}
	return result;
}

export default function EmailRoute() {
	let location = useLocation();
	let urlParams = parseQuery(location.search);

	return <Email to={urlParams.to} />;
}
