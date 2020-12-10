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

	let users = await db.all('SELECT * FROM users');
	let last24HoursUsers = users.filter((u) => u.createdAt + 86400000 >= now);

	let articles = await db.all('SELECT * FROM articles');
	let publishedArticle = articles.filter((a) => a.published);
	let last24HoursArticles = articles.filter((a) => a.createdAt + 86400000 >= now);
	let last24HoursPublishedArticles = publishedArticle.filter((a) => a.createdAt + 86400000 >= now);

	let usersData = { total: users.length, today: last24HoursUsers.length };
	let articlesData = {
		total: articles.length,
		today: last24HoursArticles.length,
		published: publishedArticle.length,
		publishedToday: last24HoursPublishedArticles.length,
	};

	let recentArticles = articles.sort((a1, a2) => a2.updatedAt - a1.updatedAt).slice(0, 10);
	for (let article of recentArticles) {
		let user = users.find((u) => u.id === article.userId);
		user.hasPublishedArticle = articles.filter((a) => a.published && a.userId === user.id).length > 0;
		article.user = user;
	}

	let user = request.user;
	user.hasPublishedArticle = articles.filter((a) => a.published && a.userId === user.id).length > 0;

	response.json({ user, usersData, articlesData, recentArticles });
});

adminRouter.get('/api/admin/users', async function (request, response) {
	let user = request.user;

	let users = await db.all(
		`SELECT *, (SELECT COUNT(*) FROM articles WHERE userId = u.id AND published = 1) AS totalPublishedArticles, (SELECT COUNT(*) FROM articles WHERE userId = u.id AND published = 0) AS totalDraftArticles FROM users AS u ORDER BY lastSeenAt DESC, createdAt DESC `,
	);

	response.json({ user, users });
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
