import Router from 'express-promise-router';
import Mailer from 'nodemailer';

import { ForbiddenError } from '../errors/http.mjs';
import db from '../database.mjs';

const production = process.env.NODE_ENV === 'production';

let mailer;
if (production) {
	mailer = Mailer.createTransport({
		sendmail: true,
		newline: 'unix',
		path: '/usr/sbin/sendmail',
	});
}

let adminRouter = Router({ strict: true });

adminRouter.use('/api/admin', async function (request, response, next) {
	if (request.user.admin == undefined || !request.user.admin) {
		throw new ForbiddenError("You don't have enough rights to perform this action");
	}

	next();
});

adminRouter.get('/api/admin', async function (request, response) {
	let now = Date.now();

	let users = await db.get('SELECT count(*) AS length FROM users');
	let last24HoursUsers = await db.get('SELECT count(*) AS length FROM users WHERE (createdAt + 86400000) >= ?', now);

	let articles = await db.get('SELECT count(*) AS length FROM articles');
	let publishedArticles = await db.get('SELECT count(*) AS length FROM articles WHERE published = 1');

	let last24HoursArticles = await db.all('SELECT * FROM articles WHERE (createdAt + 86400000) >= ?', now);
	let last24HoursPublishedArticles = await db.all(
		'SELECT * FROM articles WHERE published = 1 AND (createdAt + 86400000) >= ?',
		now,
	);

	let usersData = { total: users.length, today: last24HoursUsers.length };
	let articlesData = {
		total: articles.length,
		today: last24HoursArticles.length,
		published: publishedArticles.length,
		publishedToday: last24HoursPublishedArticles.length,
	};

	let recentArticles = await db.all('SELECT * FROM articles ORDER BY id DESC LIMIT 10');
	for (let article of recentArticles) {
		let user = await db.get('SELECT * FROM users WHERE id = ?', article.userId);
		let hasPublishedArticle = await db.get(
			'SELECT count(*) AS length FROM articles WHERE published = 1 AND userId = ?',
			user.id,
		);
		user.hasPublishedArticle = hasPublishedArticle?.length ?? 0 > 0;
		article.user = user;
	}

	let user = request.user;
	let hasPublishedArticle = await db.get(
		'SELECT count(*) AS length FROM articles WHERE published = 1 AND userId = ?',
		user.id,
	);
	user.hasPublishedArticle = hasPublishedArticle?.length ?? 0 > 0;

	response.json({ user, usersData, articlesData, recentArticles });
});

adminRouter.get('/api/admin/users', async function (request, response) {
	let user = request.user;
	let { page } = request.query;
	let searchQueryParam = request.query.search;
	let search = searchQueryParam ? `%${searchQueryParam}%` : '%%';

	let skip = (page - 1) * 10;
	let users = await db.all(
		`SELECT *, (SELECT COUNT(*) FROM articles WHERE userId = u.id AND published = 1) AS totalPublishedArticles, (SELECT COUNT(*) FROM articles WHERE userId = u.id AND published = 0) AS totalDraftArticles FROM users AS u WHERE u.username LIKE ? OR u.name LIKE ? OR u.email LIKE ? ORDER BY lastSeenAt DESC, createdAt DESC LIMIT ?, 10`,
		search,
		search,
		search,
		skip,
	);

	let totalUsers = await db.get(
		'SELECT count(*) AS length FROM users WHERE username LIKE ? OR name LIKE ? OR email LIKE ?',
		search,
		search,
		search,
	);

	let hasMore = users.length + skip < totalUsers.length;

	response.json({ user, users, totalUsers: totalUsers.length, hasMore });
});

adminRouter.post('/api/admin/mail', async function (request, response) {
	let { to, from, subject, content } = request.body;

	if (production) {
		mailer.sendMail({
			to: to,
			from: `"Scribbble.io" <${from}@scribbble.io>`,
			subject: subject,
			text: content,
		});
	} else {
		// eslint-disable-next-line no-console
		console.log(`
		📨 From: ${from}@scribbble.io\n
		To: ${to}\n
		Subject: ${subject}\n
		Content: ${content}`);
	}

	response.end();
});

export default adminRouter;
