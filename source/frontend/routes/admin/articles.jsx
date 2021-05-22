import React from 'react';
import { useData } from 'react-sprout';

import Articles from '../../pages/admin/articles.jsx';

import { get } from '../../utils/rest';

export async function getArticlesData(params, splats, urlSearch) {
	let searchParams = new URLSearchParams(urlSearch);

	let type = searchParams.get('type') ?? 'all';
	let page = searchParams.get('page') ?? 1;
	let search = searchParams.get('search') ?? '';

	return await get(`/api/admin/articles?type=${type}&page=${page}&search=${search}`);
}

export default function AdminArticlesRoute() {
	let { articles, totalArticles, hasMore } = useData();

	return <Articles articles={articles} totalArticles={totalArticles} hasMore={hasMore} />;
}
