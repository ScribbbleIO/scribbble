import Path from 'path';
import React from 'react';
import Router from 'react-sprout';
import ReactDom from 'react-dom/server.js';
import Filesystem from 'fs-extra';

import mdastToHast from 'mdast-util-to-hast';
import highlightCode from '@mapbox/rehype-prism';
import markdownToMdast from 'mdast-util-from-markdown';
import hastToReact from '../hast/hast-to-react.mjs';
import assertAccessibleDirectoryForUsername from '../assert/assert-accessible-directory-for-username.mjs';

import Article from '../../frontend/pages/article.mjs';

import db from '../../database.mjs';

const contentDirectory = Path.resolve('content');
const templatePath = Path.resolve('source', 'backend', 'templates', 'article.html');
const template = await Filesystem.readFile(templatePath, 'utf-8');

let highlight = highlightCode({ ignoreMissing: true });

export default async function updateArticlePage(articleId) {
	let article = await db.get('SELECT * FROM articles WHERE id = ? AND published = 1', articleId);
	let user = await db.get('SELECT * FROM users WHERE id = ?', article?.userId);

	if (article) {
		user.hasPublishedArticle = true;
		await update(user, article);
	}
}

export async function updateArticlePages(username) {
	let user = await db.get('SELECT * FROM users WHERE username = ?', username);
	let articles = await db.all('SELECT * FROM articles WHERE userId = ? AND published = 1', user.id);

	user.hasPublishedArticle = articles.length > 0;

	for (let article of articles) {
		await update(user, article);
	}
}

async function update(user, article) {
	let mdast = markdownToMdast(article.content);
	let hast = mdastToHast(mdast);
	highlight(hast);

	function ArticleRoute() {
		return React.createElement(Article, { ...article, author: user }, hastToReact(hast));
	}

	let url = `/${user.username}/${article.slug}/`;
	let ArticleRouter = Router.default(React.createElement(ArticleRoute, { path: url }), {
		location: url,
	});
	let render = ReactDom.renderToStaticMarkup(React.createElement(ArticleRouter));

	let articleDirectoryPath = Path.join(contentDirectory, user.username, article.slug);
	assertAccessibleDirectoryForUsername(articleDirectoryPath, user.username);

	let htmlPath = Path.join(articleDirectoryPath, 'index.html');

	let htmlContent = template;
	htmlContent = htmlContent.replace('<!-- title -->', `<title>${article.title} - Scribbble</title>`);

	if (article.description) {
		htmlContent = htmlContent.replace(
			'<!-- meta.description -->',
			`<meta name="description" content="${article.description}" />`,
		);
	} else {
		htmlContent = htmlContent.replace('<!-- meta.description -->', '');
	}

	htmlContent = htmlContent.replace(
		'<!-- link.alternate -->',
		`<link rel="alternate" type="application/atom+xml" href="/${user.username}/rss.xml" />`,
	);

	htmlContent = htmlContent.replace('<!-- content -->', render);

	await Filesystem.outputFile(htmlPath, htmlContent);
}
