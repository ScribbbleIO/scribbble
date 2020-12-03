import Path from 'path';
import React from 'react';
import ReactDom from 'react-dom/server.js';
import Mailer from 'nodemailer';
import Router from 'express-promise-router';
import Filesystem from 'fs-extra';

import Email from '../frontend/pages/email.mjs';

import db from '../database.mjs';
import { UnauthorizedError, BadRequestError, NotFoundError } from '../errors/http.mjs';
import { generateEmailToken, generateSessionToken } from '../utils/token.mjs';

const production = process.env.NODE_ENV === 'production';
const development = process.env.NODE_ENV === 'development' || process.env.NODE_ENV == undefined;

const staticPath = Path.resolve('static');
const emailTemplateTextPath = Path.join('source', 'backend', 'templates', 'email.txt');
const emailTemplateHtmlPath = Path.join('source', 'backend', 'templates', 'email.html');
const emailTemplateText = await Filesystem.readFile(emailTemplateTextPath, 'utf-8');
const emailTemplateHtml = await Filesystem.readFile(emailTemplateHtmlPath, 'utf-8');

let mailer;
if (production) {
	mailer = Mailer.createTransport({
		sendmail: true,
		newline: 'unix',
		path: '/usr/sbin/sendmail',
	});
}

let emailPageTemplatePath = Path.resolve('source', 'backend', 'static', 'email.html');
let emailPageTemplate = await Filesystem.readFile(emailPageTemplatePath, 'utf-8');
let emailPageContent = ReactDom.renderToStaticMarkup(React.createElement(Email, { to: 'scribbble@scribbble.io' }));
emailPageTemplate = emailPageTemplate.replace('<!-- content -->', emailPageContent);

let authenticationRouter = Router({ strict: true });

authenticationRouter.post('/login', async function (request, response) {
	if (request.body.type === 'email') {
		let { email } = request.body;
		let user = await db.get('SELECT * FROM users WHERE email = ?', email);
		let userId = user?.id;

		if (userId == undefined) {
			let userResult = await db.run('INSERT INTO users (email) VALUES (?)', email);
			if (userResult) {
				userId = userResult.lastID;
			}
		}

		let token = await db.run(
			'SELECT * FROM tokens WHERE userId = ? AND type = "email" AND expireAt > ?',
			userId,
			Date.now(),
		);
		let tokenValue = token?.value;

		if (tokenValue == undefined) {
			tokenValue = await generateEmailToken();
			await db.run('DELETE FROM tokens WHERE userId = ? AND type = "email"', userId);
			await db.run('INSERT INTO tokens (userId, type, value) VALUES (?,"email",?)', userId, tokenValue);
		}

		let scheme = 'http';
		if (production) {
			scheme = scheme + 's';
		}

		let url = `${scheme}://${request.headers.host}/api/login?token=${tokenValue}`;
		if (production) {
			let textTemplate = emailTemplateText;
			let htmlTemplate = emailTemplateHtml;

			textTemplate = textTemplate.replace('login-url-to-replace', url);
			htmlTemplate = htmlTemplate.replace('login-url-to-replace', url);

			mailer.sendMail({
				to: email,
				from: '"Scribbble.io" <login@scribbble.io>',
				subject: 'Log in to Scribbble',
				html: htmlTemplate,
				text: textTemplate,
			});
		} else if (development) {
			console.log(`🔑 ${url}`); // eslint-disable-line no-console
		}

		let document = emailPageTemplate.replace('scribbble@scribbble.io', email);

		response.send(document);
	}
});

authenticationRouter.get('/api/login', async function (request, response, next) {
	let requestToken = request.query.token;
	if (requestToken == undefined) {
		throw new BadRequestError('No token specified');
	}

	let token = await db.get('SELECT * FROM tokens WHERE type = "email" AND value = ?', requestToken);
	if (token) {
		let user = await db.get('SELECT * FROM users WHERE id = ?', token.userId);
		let sessionToken = await generateSessionToken();

		// Do not delete the email token, as the user could mistakenly click the link on another device and maybe needs a retry
		await db.run(
			'INSERT INTO tokens(userId, type, value, expireAt) VALUES (?, "session", ?, NULL)',
			user.id,
			sessionToken,
		);

		let location;
		let host = request.headers.host;
		if (host === 'scribbble.io' || development) {
			let articles = await db.get('SELECT COUNT(*) AS length FROM articles WHERE userId = ?', user.id);
			location = articles.length ? '/dashboard' : '/new';
		} else if (host === 'admin.scribbble.io') {
			location = '/';
		}

		response.set('Location', location);
		response.status(303);
		response.cookie('id', sessionToken, {
			path: '/',
			secure: production,
			domain: production ? 'scribbble.io' : undefined,
			maxAge: 2147483647000,
			httpOnly: true,
		});
		response.end();
	} else {
		setTimeout(function () {
			next(new NotFoundError('Token not found'));
		}, 2000);
	}
});

// We need to let the backend decide to render the static page or not based on
// the logged in user
authenticationRouter.get('/login', async function (request, response) {
	if (request.user) {
		let articles = await db.get('SELECT COUNT(*) AS length FROM articles WHERE userId = ?', request.user.id);
		let location = articles.length ? '/dashboard' : '/new';
		response.set('Location', location);
		response.status(303);
		response.end();
	} else {
		response.sendFile('login.html', { root: staticPath });
	}
});

authenticationRouter.delete('/api/tokens', async function (request, response) {
	let user = request.user;
	if (user == undefined) {
		throw new UnauthorizedError();
	}

	await db.run('DELETE FROM tokens WHERE userId = ? AND type = "session"', user.id);

	response.end();
});

export default authenticationRouter;
