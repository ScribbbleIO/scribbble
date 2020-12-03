import Express from 'express';
import bodyParser from 'body-parser';

import usersRouter from './routes/users.mjs';
import articlesRouter from './routes/articles.mjs';
import sessionMiddleware from './middleware/session.mjs';
import authenticationRouter from './routes/authentication.mjs';

import { UnauthorizedError } from './errors/http.mjs';
import adminRouter from './routes/admin.mjs';

const port = 4000;

let server = new Express();
let bodyMiddleware = Express.urlencoded({ extended: true });

server.use(sessionMiddleware);
server.use(bodyMiddleware);
server.use(bodyParser.json());

server.use(authenticationRouter);

server.use(function (request, response, next) {
	let user = request.user;
	if (user == undefined) {
		throw new UnauthorizedError('Not authorized');
	}

	next();
});

server.use(adminRouter);
server.use(usersRouter);
server.use(articlesRouter);

server.listen(port, function () {
	console.log(`🚀 Backend running on port ${port}`); // eslint-disable-line no-console
});
