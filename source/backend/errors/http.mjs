export class HTTPError extends Error {
	constructor(status, message) {
		super(message);
		this.status = status;
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
