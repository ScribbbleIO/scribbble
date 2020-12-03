import React from 'react';
import Write from './write';
import { useData } from 'react-sprout';
import { get } from '../utils/rest';

export async function getNewData() {
	return await get('/api/profile');
}

export default function New() {
	let user = useData();
	let article = { title: '', content: '' };

	return <Write user={user} article={article} />;
}
