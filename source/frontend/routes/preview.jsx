import React, { useEffect, useLayoutEffect } from 'react';
import { useData } from 'react-sprout';
import { get } from '../utils/rest';

import Article from '../pages/article';

import mdastToHast from 'mdast-util-to-hast';
import hastToReact from '../utils/hast/hast-to-react.js';
import hastHighlight from 'rehype-highlight';
import markdownToMdast from 'mdast-util-from-markdown';

export async function getPreviewData({ slug }) {
	let promises = [await get('/api/profile'), await get('/api/articles/' + slug)];
	let [user, article] = await Promise.all(promises);
	return { user, article };
}

export default function PreviewRoute() {
	let { user, article } = useData();
	let { title, publishedAt, content } = article;

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

	let highlight = hastHighlight();

	let mdast = markdownToMdast(content);
	let hast = mdastToHast(mdast);
	highlight(hast);

	let children = hastToReact(hast);

	return (
		<Article title={title} publishedAt={publishedAt} author={user}>
			{children}
		</Article>
	);
}
