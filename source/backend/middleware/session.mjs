import cookie from 'cookie';
import db from '../database.mjs';

export default async function sessionMiddleware(request, response, next) {
	try {
		let requestCookie = request.headers.cookie;
		if (requestCookie) {
			let cookies = cookie.parse(requestCookie);
			let token = cookies.id;
			if (token != undefined) {
				let now = Date.now();
				let session = await db.get(
					'SELECT * FROM tokens WHERE value = ? AND type = "session" AND (expireAt > ? OR expireAt IS NULL)',
					token,
					now,
				);
				if (session) {
					let user = await db.get('SELECT * FROM users WHERE id = ?', session.userId);
					if (user) {
						await db.run('UPDATE tokens SET usedAt = ? WHERE id = ?', now, session.id);
						await db.run('UPDATE users SET lastSeenAt = ? WHERE id = ?', now, user.id);
						request.user = user;
					}
				}
			}
		}
		next();
	} catch (error) {
		next(error);
	}
}
