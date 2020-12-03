import React from 'react';
import { useData } from 'react-sprout';
import { get } from '../utils/rest';
import Write from './write';

export async function getEditData({ slug }) {
	let promises = [await get('/api/profile'), await get('/api/articles/' + slug)];
	let [user, article] = await Promise.all(promises);
	return { user, article };
}

export default function Edit() {
	let { user, article } = useData();

	return <Write user={user} article={article} />;
}
