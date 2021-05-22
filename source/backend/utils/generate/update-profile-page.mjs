import Path from 'path';
import React from 'react';
import Router from 'react-sprout';
import ReactDom from 'react-dom/server.js';
import Filesystem from 'fs-extra';

import Profile from '../../frontend/pages/profile.mjs';

import db from '../../database.mjs';

const contentDirectory = Path.resolve('content');
const templatePath = Path.resolve('source', 'backend', 'templates', 'profile.html');
const template = await Filesystem.readFile(templatePath, 'utf-8');

export default async function updateProfilePage(username) {
	let user = await db.get('SELECT * FROM users WHERE username = ?', username);
	let articles = await db.all('SELECT * FROM articles WHERE userId = ? AND published = 1', user.id);

	let userDirectory = Path.join(contentDirectory, user.username);
	let profilePath = Path.join(userDirectory, 'index.html');
	if (articles.length > 0) {
		function ProfileRoute() {
			return React.createElement(Profile, { user, articles });
		}

		let url = `/${user.username}/`;
		let ProfileRouter = Router(React.createElement(ProfileRoute, { path: url }), {
			location: url,
		});
		let render = ReactDom.renderToStaticMarkup(React.createElement(ProfileRouter));

		let htmlContent = template;
		htmlContent = htmlContent.replace('<!-- title -->', `<title>${user.name ?? user.username} - Scribbble</title>`);

		if (user.description) {
			htmlContent = htmlContent.replace(
				'<!-- meta.description -->',
				`<meta name="description" content="${user.description}" />`,
			);
		} else {
			htmlContent = htmlContent.replace('<!-- meta.description -->', '');
		}

		htmlContent = htmlContent.replace(
			'<!-- link.alternate -->',
			`<link rel="alternate" type="application/atom+xml" href="/${user.username}/rss.xml" />`,
		);

		htmlContent = htmlContent.replace('<!-- content -->', render);

		await Filesystem.outputFile(profilePath, htmlContent);
	} else {
		let exists = await Filesystem.pathExists(profilePath);
		if (exists) {
			await Filesystem.unlink(profilePath);
		}
	}
}
