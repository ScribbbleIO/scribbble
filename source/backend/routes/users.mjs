import Path from 'path';
import Busboy from 'busboy';
import Router from 'express-promise-router';
import Filesystem from 'fs-extra';
import Operatingsystem from 'os';

import db from '../database.mjs';
import updateFeed from '../utils/generate/update-feed.mjs';
import updateProfilePage from '../utils/generate/update-profile-page.mjs';
import { NotFoundError } from '../errors/http.mjs';
import { updateArticlePages } from '../utils/generate/update-article-page.mjs';

const contentDirectory = Path.resolve('content');
const tempDirectory = Operatingsystem.tmpdir();

let usersRouter = Router({ strict: true });

usersRouter.get('/api/profile', async function (request, response) {
	let user = request.user;
	let userArticles = await db.all('SELECT * FROM articles WHERE userId = ? AND published = 1', user.id);

	user.hasPublishedArticle = userArticles.length > 0;

	response.json(user);
});

usersRouter.patch('/api/profile', async function (request, response, next) {
	let userDirectory = Path.join(contentDirectory, request.user.username);

	let files = [];
	let fields = {};

	let busboy = new Busboy({ headers: request.headers, limits: { files: 1, fileSize: 100000 } });

	busboy.on('file', function (fieldname, file) {
		try {
			let avatarFile = new Promise(function (resolve, reject) {
				let filePath = Path.join(tempDirectory, `${request.user.username}.jpg`);
				let fileStream = Filesystem.createWriteStream(filePath);

				fileStream.on('close', function () {
					resolve(filePath);
				});
				fileStream.on('error', function () {
					reject();
				});
				file.on('limit', function () {
					reject();
				});
				file.pipe(fileStream);
			});

			files.push(avatarFile);
		} catch (error) {
			next(error);
		}
	});

	busboy.on('field', function (fieldname, value) {
		try {
			fields[fieldname] = JSON.parse(value);
		} catch (error) {
			next(error);
		}
	});

	busboy.on('finish', async function () {
		try {
			let [avatarTempFilePath] = await Promise.all(files);

			let user = { ...request.user, ...fields.profile };

			if (avatarTempFilePath) {
				let avatarFileName = 'avatar.jpg';
				let avatarFilePath = Path.join(userDirectory, avatarFileName);
				await Filesystem.move(avatarTempFilePath, avatarFilePath, { overwrite: true });
				user.avatarUrl = avatarFileName;
			}

			if (fields.deleteAvatar) {
				let avatarPath = Path.join(userDirectory, user.avatarUrl);
				await Filesystem.unlink(avatarPath);
				user.avatarUrl = undefined;
			}

			let name, description;
			if (user.name != undefined && user.name !== '') {
				name = user.name;
			}

			if (user.description != undefined && user.description !== '') {
				description = user.description;
			}

			let now = Date.now();

			await db.run(
				'UPDATE users SET name = ?, description = ?, avatarUrl = ?, updatedAt = ? WHERE id = ?',
				name,
				description,
				user.avatarUrl,
				now,
				user.id,
			);

			let updatedUser = await db.get('SELECT * FROM users WHERE id = ?', user.id);
			await updateArticlePages(updatedUser.username);
			await updateProfilePage(updatedUser.username);
			await updateFeed(updatedUser.username);

			let userArticles = await db.all(
				'SELECT * FROM articles WHERE userId = ? AND published = 1',
				updatedUser.id,
			);
			updatedUser.hasPublishedArticle = userArticles.length > 0;

			response.json({ user: updatedUser });
		} catch (error) {
			next(error);
		}
	});

	return request.pipe(busboy);
});

usersRouter.get('/api/users/:username', async function (request, response) {
	let username = request.params.username;

	let user = await db.get('SELECT * FROM users WHERE username = ?', username);
	if (user == undefined) {
		throw new NotFoundError(`No user with username "${username}" found`);
	}

	response.json(user);
});

usersRouter.get('/api/users/:username/articles/:slug', async function (request, response) {
	let username = request.params.username;
	let slug = request.params.slug;

	let user = await db.get('SELECT * FROM users WHERE username = ?', username);
	if (user == undefined) {
		throw new NotFoundError(`No user with username "${username}" found`);
	}

	let article = await db.get('SELECT * FROM articles WHERE userId = ? AND slug = ?', user.id, slug);
	if (article == undefined) {
		throw new NotFoundError(`No article with slug "${slug}" found for user with username "${username}"`);
	}

	let articles = await db.all('SELECT * FROM articles WHERE userId = ? AND published = 1', user.id);
	user.hasPublishedArticle = articles.length > 0;

	response.json({ article, author: user });
});

usersRouter.get('/api/users/:username/articles', async function (request, response) {
	let username = request.params.username;
	let user = await db.get('SELECT * FROM users WHERE username = ?', username);
	let articles = await db.all('SELECT * FROM articles WHERE userId = ? AND published = 1', user.id);

	user.hasPublishedArticle = articles.length > 0;

	response.json({ user, articles });
});

export default usersRouter;
