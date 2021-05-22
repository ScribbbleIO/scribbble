import React from 'react';
import { useData } from 'react-sprout';

import { get } from '../../utils/rest';
import Header from './header';

export async function getLayoutData() {
	return get('/api/profile');
}

export default function Layout(props) {
	let user = useData();

	return (
		<div className="h-full px-6 overflow-auto font-sans bg-gray-50">
			<div className="max-w-4xl pt-6 mx-auto text-gray-700">
				<Header user={user} />
				<div className="py-6">{props.children}</div>
			</div>
		</div>
	);
}
