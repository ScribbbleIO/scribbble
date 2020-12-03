export class HTTPError extends Error {
	constructor(code, message) {
		super(message);
		this.code = code;
	}
}

export class BadRequestError extends HTTPError {
	constructor(message) {
		super(400, message);
	}
}

export class UnauthorizedError extends HTTPError {
	constructor(message) {
		super(401, message);
	}
}

export class ForbiddenError extends HTTPError {
	constructor(message) {
		super(403, message);
	}
}

export class NotFoundError extends HTTPError {
	constructor(message) {
		super(404, message);
	}
}

export default function error(code, message) {
	if (code === 400) return new BadRequestError(message);
	if (code === 401) return new UnauthorizedError(message);
	if (code === 403) return new ForbiddenError(message);
	if (code === 404) return new NotFoundError(message);
	return new HTTPError(code, message);
}
