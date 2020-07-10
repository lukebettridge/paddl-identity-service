/**
 * Common errors raised by service functions under certain conditions. Should be handled within the application
 * @class
 * @classdesc Common errors raised by system
 */
export default class OperationalError extends Error {
	public message: string;
	public type: string;
	public statusCode: number;

	constructor(message: string, type?: string) {
		super();
		this.message = message;
		this.type = type ? type : this.constructor.name;
	}
}

/**
 * Operation was forbidden
 * @export
 * @class ForbiddenError
 * @extends {OperationalError}
 */
export class ForbiddenError extends OperationalError {
	constructor(message: string, type?: string) {
		super(message, type);
		this.statusCode = 403;
	}
}

/**
 * Server error occurred during operation
 * @export
 * @class InternalServerError
 * @extends {OperationalError}
 */
export class InternalServerError extends OperationalError {
	constructor(message: string, type?: string) {
		super(message, type);
		this.statusCode = 500;
	}
}

/**
 * Operation could not be authenticated
 * @export
 * @class UnauthorizedError
 * @extends {OperationalError}
 */
export class UnauthorizedError extends OperationalError {
	constructor(message: string, type?: string) {
		super(message, type);
		this.statusCode = 401;
	}
}

/**
 * Operation could not be processed
 * @export
 * @class BadRequestError
 * @extends {OperationalError}
 */
export class BadRequestError extends OperationalError {
	constructor(message: string, type?: string) {
		super(message, type);
		this.statusCode = 400;
	}
}
