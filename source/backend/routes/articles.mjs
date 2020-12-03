import Path from 'path';
import Busboy from 'busboy';
import Router from 'express-promise-router';
import Archiver from 'archiver';
import Filesystem from 'fs-extra';
import OperatingSystem from 'os';

import mdastToMarkdown from 'mdast-util-to-markdown';
import markdownToMdast from 'mdast-util-from-markdown';

import { v4 as UUID } from 'uuid';
import { BadRequestError, NotFoundError } from '../errors/http.mjs';

import db from '../database.mjs';
import visit from '../utils/ast/visit.mjs';
import updateFeed from '../utils/generate/update-feed.mjs';
import updateProfilePage from '../utils/generate/update-profile-page.mjs';
import assertValidUsername from '../utils/assert/assert-valid-username.mjs';
import assertAccessibleDirectoryForUsername from '../utils/assert/assert-accessible-directory-for-username.mjs';
import updateArticlePage from '../utils/generate/update-article-page.mjs';

const contentDirectory = Path.resolve('content');

let articlesRouter = Router({ strict: true });

articlesRouter.get('/export', async function (request, response) {
	let user = request.user;
	let archive = Archiver('zip');
	let archiveDirectory = Path.join(contentDirectory, request.user.username);
	let articles = await db.all('SELECT * FROM articles WHERE userId = ?', user.id);

	archive.pipe(response);
	archive.glob('*/*.jpg', { cwd: archiveDirectory });

	for (let { slug, content } of articles) {
		archive.append(content, { name: `${slug}/index.md` });
	}

	archive.finalize();

	response.set('Content-Type', 'application/zip');
	response.set('Content-disposition', 'attachment; filename=scribbble.zip');
});

articlesRouter.get('/api/articles', async function (request, response) {
	let articles = await db.all('SELECT * FROM articles WHERE userId = ?', request.user.id);
	for (let article of articles) {
		article.published = Boolean(article.published);
	}

	response.json(articles);
});

articlesRouter.get('/api/articles/:slug', async function (request, response) {
	let slug = request.params.slug;

	let article = await db.get('SELECT * FROM articles WHERE userId = ? AND slug = ?', request.user.id, slug);
	if (article == undefined) {
		throw new NotFoundError(`No article found with url "${slug}"`);
	}
	article.published = Boolean(article.published);

	response.json(article);
});

articlesRouter.post('/api/articles', async function (request, response, next) {
	let files = [];
	let fields = {};
	let busboy = new Busboy({ headers: request.headers, limits: { files: 100, fileSize: 10000000 } });
	let tempDirectory;

	// For every file we create a promise and put it in the files array
	busboy.on('file', async function (fieldname, file, filename) {
		try {
			if (tempDirectory == undefined) {
				tempDirectory = await Filesystem.mkdtemp(Path.join(OperatingSystem.tmpdir(), Path.sep));
			}

			let filePromise = new Promise(function (resolve, reject) {
				let filePath = Path.join(tempDirectory, filename);
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

			files.push(filePromise);
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
			// Wait for all images to have been saved to temporary directory
			let filePaths = await Promise.all(files);

			let user = request.user;
			let { username, article } = fields;
			let { published, pinned, slug, content, title, description } = article;

			if (title == undefined || title === '') {
				throw new BadRequestError('No title provided');
			}

			if (username != undefined) {
				assertValidUsername(username);

				let now = Date.now();

				// Check and update username
				if (user.username == undefined) {
					let existingUser = await db.get('SELECT * FROM users WHERE username = ?', username);
					if (existingUser) {
						throw new Error('Username is already taken');
					}
					await db.run('UPDATE users SET username = ?, updatedAt = ? WHERE id = ?', username, now, user.id);
					user.username = username;
				}

				let publishedAt;
				if (published) {
					publishedAt = now;
				}

				let pinnedAt;
				if (pinned) {
					pinnedAt = now;
				}

				// Create and check article path
				let articleDirectoryPath = Path.join(contentDirectory, user.username, slug);
				assertAccessibleDirectoryForUsername(articleDirectoryPath, user.username);

				// Move temporary images to correct directory and update the markdown
				let mdast = markdownToMdast(content);
				await visit(mdast, async function (node) {
					if (node.type === 'image') {
						let url = node.url;
						if (url.startsWith('blob:')) {
							let segments = url.split('/');
							let fileuuid = segments[segments.length - 1];
							let filePath = filePaths.find((filePath) => filePath.includes(fileuuid));
							if (filePath) {
								let fileName = Path.basename(filePath);
								let targetPath = Path.join(articleDirectoryPath, fileName);
								node.url = fileName;
								await Filesystem.ensureDir(articleDirectoryPath);
								await Filesystem.move(filePath, targetPath);
							}
						}
					}
				});

				let markdown = mdastToMarkdown(mdast);

				// Update the database
				let uuid = UUID();
				let insertResult = await db.run(
					`INSERT INTO articles ("userId", "uuid", "title", "description", "slug", "content", "published", "publishedAt", "pinnedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					user.id,
					uuid,
					title,
					description,
					slug,
					markdown,
					published,
					publishedAt,
					pinnedAt,
				);

				let articleResult = await db.get('SELECT * FROM articles WHERE id = ?', insertResult.lastID);
				if (published) {
					// Save the transformed markdown
					let markdownPath = Path.join(articleDirectoryPath, 'index.md');
					await Filesystem.outputFile(markdownPath, markdown);

					// Save article page, new profilepage and new rss feed
					await updateArticlePage(articleResult.id);
					await updateProfilePage(user.username);
					await updateFeed(user.username);
				}

				// Respond with the saved article
				response.json({ article: articleResult });
			}
		} catch (error) {
			next(error);
		}
	});

	return request.pipe(busboy);
});

articlesRouter.patch('/api/articles/:id', async function (request, response, next) {
	let id = parseInt(request.params.id, 10);

	let files = [];
	let fields = {};
	let busboy = new Busboy({ headers: request.headers, limits: { files: 100, fileSize: 10000000 } });
	let tempDirectory;

	// For every file we create a promise and put it in the files array
	busboy.on('file', async function (fieldname, file, filename) {
		try {
			if (tempDirectory == undefined) {
				tempDirectory = await Filesystem.mkdtemp(Path.join(OperatingSystem.tmpdir(), Path.sep));
			}

			let filePromise = new Promise(function (resolve, reject) {
				let filePath = Path.join(tempDirectory, filename);
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

			files.push(filePromise);
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
			// Wait for all images to have been saved to temporary directory
			let filePaths = await Promise.all(files);

			let user = request.user;
			let { title, content } = fields.article;

			if (title == undefined || title === '') {
				throw new BadRequestError('No title provided');
			}

			let article = await db.get('SELECT * FROM articles WHERE id = ? AND userId = ?', id, user.id);

			if (article == undefined) {
				throw new NotFoundError(`No article found with id ${id}`);
			}

			// Create and check article path
			let articleDirectoryPath = Path.join(contentDirectory, user.username, article.slug);
			assertAccessibleDirectoryForUsername(articleDirectoryPath, user.username);

			// Find all current images in the article directory to keep track of all the
			// unused images to delete later
			let imageFileNames = [];
			let articleDirectoryExists = await Filesystem.pathExists(articleDirectoryPath);
			if (articleDirectoryExists) {
				let fileEntries = await Filesystem.readdir(articleDirectoryPath, { withFileTypes: true });
				for (let fileEntry of fileEntries) {
					let extension = Path.extname(fileEntry.name);
					let isFile = fileEntry.isFile();
					let isImage = extension === '.png' || extension === '.jpg' || extension === '.gif';

					if (isFile && isImage) {
						imageFileNames.push(fileEntry.name);
					}
				}
			}

			// Move temporary images to correct directory and update the markdown
			let mdast = markdownToMdast(content);
			await visit(mdast, async function (node) {
				if (node.type === 'image') {
					let url = node.url;
					if (url.startsWith('blob:')) {
						let segments = url.split('/');
						let fileuuid = segments[segments.length - 1];
						let filePath = filePaths.find((filePath) => filePath.includes(fileuuid));
						let fileName = Path.basename(filePath);
						let targetPath = Path.join(articleDirectoryPath, fileName);

						node.url = fileName;

						await Filesystem.ensureDir(targetPath);
						await Filesystem.move(filePath, targetPath, { overwrite: true });
					} else {
						// Remove the file from imageFileNames because we want to keep them
						let imageFilenameIndex = imageFileNames.indexOf(node.url);
						if (imageFilenameIndex !== -1) {
							imageFileNames.splice(imageFilenameIndex, 1);
						}
					}
				}
			});

			// Delete all the images that are not used in the article
			for (let imageFileName of imageFileNames) {
				await Filesystem.unlink(Path.join(articleDirectoryPath, imageFileName));
			}

			// Convert back to markdown now that the blob urls have been updated to the real filenames
			let markdown = mdastToMarkdown(mdast);

			let now = Date.now();

			// Update the database
			await db.run(
				'UPDATE articles SET title = ?, content = ?, updatedAt = ? WHERE id = ?',
				title,
				markdown,
				now,
				id,
			);

			let articleResult = await db.get('SELECT * FROM articles WHERE id = ?', id);
			if (articleResult.published) {
				// Save the transformed markdown
				let markdownPath = Path.join(articleDirectoryPath, 'index.md');
				await Filesystem.outputFile(markdownPath, markdown);

				// Save new articlepage
				await updateArticlePage(articleResult.id);

				// Save new profilepage
				if (title !== article.title) {
					await updateProfilePage(user.username);
				}

				// Save new rss feed
				await updateFeed(user.username);
			}

			// Respond with the saved article
			response.json({ article: articleResult });
		} catch (error) {
			next(error);
		}
	});

	return request.pipe(busboy);
});

articlesRouter.patch('/api/articles/details/:id', async function (request, response) {
	let user = request.user;

	let id = parseInt(request.params.id, 10);
	let dbArticle = await db.get('SELECT * FROM articles WHERE id = ? AND userId = ?', id, user.id);
	let article = { ...dbArticle, ...request.body };

	if (article.title == undefined || article.title === '') {
		throw new BadRequestError('No title provided');
	}

	// If the slug of the article changed, update the folder name
	if (request.body.slug != undefined && dbArticle.slug !== request.body.slug) {
		let oldArticlePath = Path.join(contentDirectory, user.username, dbArticle.slug);
		let newArticlePath = Path.join(contentDirectory, user.username, article.slug);

		let oldArticlePathExists = await Filesystem.pathExists(oldArticlePath);
		if (oldArticlePathExists) {
			await Filesystem.rename(oldArticlePath, newArticlePath);
		}
	}

	let now = Date.now();

	let publishedAt = article.publishedAt;
	if (request.body.published && article.publishedAt == undefined) {
		publishedAt = now;
	}

	let pinnedAt = article.pinnedAt;
	if (request.body.pinned === true && article.pinnedAt == undefined) {
		pinnedAt = now;
	} else if (request.body.pinned === false) {
		pinnedAt = undefined;
	}

	await db.run(
		`UPDATE articles SET title = ?, description = ?, slug = ?, published = ?, publishedAt = ?, pinnedAt = ?, updatedAt = ? WHERE id = ?`,
		article.title,
		article.description,
		article.slug,
		article.published,
		publishedAt,
		pinnedAt,
		now,
		id,
	);

	let articleResult = await db.get('SELECT * FROM articles WHERE id = ?', id);

	// Articles becomes published
	if (!dbArticle.published && request.body.published) {
		// Generate article html page and md page
		let articlePath = Path.join(contentDirectory, user.username, article.slug);

		// Save the transformed markdown
		let markdownPath = Path.join(articlePath, 'index.md');
		await Filesystem.outputFile(markdownPath, articleResult.content);
	}

	// Article becomes draft
	if (dbArticle.published && !request.body.published) {
		let articlePath = Path.join(contentDirectory, user.username, article.slug);
		let markdownPath = Path.join(articlePath, 'index.md');
		let htmlPath = Path.join(articlePath, 'index.html');

		await Filesystem.unlink(markdownPath);
		await Filesystem.unlink(htmlPath);
	}

	await updateArticlePage(articleResult.id);
	await updateProfilePage(user.username);
	await updateFeed(user.username);

	response.json({ article: articleResult });
});

articlesRouter.delete('/api/articles/:id', async function (request, response) {
	let user = request.user;

	let id = parseInt(request.params.id, 10);
	let article = await db.get('SELECT * FROM articles WHERE userId = ? AND id = ?', user.id, id);
	if (article == undefined) {
		throw new NotFoundError(`No article found with id ${id}`);
	}

	// Remove folder
	let articlePath = Path.join(contentDirectory, user.username, article.slug);
	await Filesystem.remove(articlePath);

	await db.run('DELETE FROM articles WHERE id = ?', id);

	// Only update when published article is removed
	if (article.published) {
		await updateProfilePage(user.username);
		await updateFeed(user.username);
	}

	response.end();
});

export default articlesRouter;
