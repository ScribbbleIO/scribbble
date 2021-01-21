import React from 'react';
import Article from '../pages/article';
import { useData } from 'react-sprout';
import { get } from '../utils/rest';

import mdastToHast from 'mdast-util-to-hast';
import hastToReact from '../utils/hast/hast-to-react.js';
import hightlightCode from '@mapbox/rehype-prism';
import markdownToMdast from 'mdast-util-from-markdown';

let highlight = hightlightCode({ ignoreMissing: true });

export async function getArticleData({ username, slug }) {
	return await get(`/api/users/${username}/articles/${slug}`);
}

export default function ArticleRoute() {
	let { article, author } = useData();
	let { title, content, slug, publishedAt } = article;

	let mdast = markdownToMdast(content);
	let hast = mdastToHast(mdast);
	highlight(hast);
	let children = hastToReact(hast);

	return (
		<Article title={title} author={author} slug={slug} publishedAt={publishedAt}>
			{children}
		</Article>
	);
}
