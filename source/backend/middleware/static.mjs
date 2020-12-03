import Path from 'path';
import Express from 'express';

const buildPath = Path.resolve('build');
const staticPath = Path.resolve('static');
const contentPath = Path.resolve('content');

let buildMiddleware = Express.static(buildPath, { redirect: false, extensions: ['html'] });
let staticMiddleware = Express.static(staticPath, { redirect: false, extensions: ['html'], index: false });
let contentMiddleware = Express.static(contentPath, { redirect: false });

let middleware = function (request, response, next) {
	staticMiddleware(request, response, function () {
		buildMiddleware(request, response, next);
	});
};

export default function (request, response, next) {
	let length = request.url.split('/').length;
	let trailing = request.url.endsWith('/');

	let isProfileUrl = length === 3 && trailing;
	let isArticleUrl = length === 4 && trailing;
	let isResourceUrl = length === 4 && !trailing;

	if (isProfileUrl || isArticleUrl || isResourceUrl) {
		contentMiddleware(request, response, function () {
			middleware(request, response, next);
		});
	} else {
		middleware(request, response, next);
	}
}
