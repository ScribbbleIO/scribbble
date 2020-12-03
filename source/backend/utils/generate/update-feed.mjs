import Rss from 'rss';
import Path from 'path';
import Filesystem from 'fs-extra';

import db from '../../database.mjs';

import hastToHtml from 'hast-util-to-html';
import mdastToHast from 'mdast-util-to-hast';
import markdownToMdast from 'mdast-util-from-markdown';
import relativeToAbsoluteUrls from '../mdast/relative-to-absolute-urls.mjs';

import { sortArticles } from '../sort.mjs';

const scribbble = 'https://scribbble.io';
const contentDirectory = Path.resolve('content');

export default async function updateFeed(username) {
	let now = new Date();
	let user = await db.get('SELECT * FROM users WHERE username = ?', username);
	let articles = await db.all('SELECT * FROM articles WHERE userId = ? AND published = 1', user.id);

	let name = user.name ?? user.username;
	let userImageUrl = user.avatarUrl ? `${scribbble}/${user.username}/${user.avatarUrl}` : `${scribbble}/rss-icon.png`;

	let feedOptions = {
		title: name,
		pubDate: now,
		generator: 'Scribbble',
		feed_url: `${scribbble}/${user.username}/rss.xml`,
		site_url: `${scribbble}/${user.username}/`,
		image_url: userImageUrl,
	};

	if (user.description != undefined) {
		feedOptions.description = user.description;
	}

	let feed = new Rss(feedOptions);
	let sortedArticles = articles.sort(sortArticles);
	for (let article of sortedArticles) {
		let articleUrl = `${scribbble}/${user.username}/${article.slug}/`;

		let mdast = markdownToMdast(article.content);
		relativeToAbsoluteUrls(mdast, articleUrl);
		let hast = mdastToHast(mdast);
		let html = hastToHtml(hast);

		let articleOptions = {
			url: `${scribbble}/${user.username}/${article.slug}/`,
			date: new Date(article.publishedAt),
			title: article.title,
			description: html,
		};

		feed.item(articleOptions);
	}

	let userDirectory = Path.join(contentDirectory, user.username);
	let rssFeedContent = feed.xml();
	let rssFeedPath = Path.join(userDirectory, 'rss.xml');

	await Filesystem.outputFile(rssFeedPath, rssFeedContent);
}
