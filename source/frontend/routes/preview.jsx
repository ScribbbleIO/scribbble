import React, { useEffect, useLayoutEffect } from 'react';
import { useData } from 'react-sprout';
import { get } from '../utils/rest';

import Article from '../pages/article';

import mdastToHast from 'mdast-util-to-hast';
import hastToReact from '../utils/hast/hast-to-react.js';
import highlightCode from '@mapbox/rehype-prism';
import markdownToMdast from 'mdast-util-from-markdown';
import transformRelativeImages from '../utils/mdast/transform-relative-images';

const development = (import.meta.env?.MODE ?? process?.env?.NODE_ENV ?? 'development') === 'development';
const baseUrl = development ? 'http://localhost:8080' : 'https://scribbble.io';
let highlight = highlightCode({ ignoreMissing: true });

export async function getPreviewData({ slug }) {
	let promises = [await get('/api/profile'), await get('/api/articles/' + slug)];
	let [user, article] = await Promise.all(promises);
	return { user, article };
}

export default function PreviewRoute() {
	let { user, article } = useData();
	let { title, content, slug, publishedAt } = article;

	useLayoutEffect(() => {
		document.body.classList.add('dark:bg-dark');

		return () => {
			document.body.classList.remove('dark:bg-dark');
		};
	}, []);

	useEffect(() => {
		document.title = 'Preview - ' + title + ' - Scribbble';

		return () => {
			document.title = 'Scribbble';
		};
	}, []);

	let articleBaseUrl = `${baseUrl}/${user.username}/${article.slug}/`;

	let mdast = markdownToMdast(content);
	transformRelativeImages(mdast, articleBaseUrl);
	let hast = mdastToHast(mdast);
	highlight(hast);

	let children = hastToReact(hast);

	return (
		<Article title={title} author={user} slug={slug} publishedAt={publishedAt}>
			{children}
		</Article>
	);
}
