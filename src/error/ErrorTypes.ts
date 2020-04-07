/**
 * Common errors raised by service functions under certain conditions. Should be handled within the application.
 * @class
 * @classdesc Common errors raised by system.
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
 * Email already exists in the database.
 * @export
 * @class EmailAlreadyExistsError
 * @extends {OperationalError}
 */
export class EmailAlreadyExistsError extends OperationalError {
	constructor(message: string, type?: string) {
		super(message, type);
		this.statusCode = 403;
	}
}

/**
 * Encryption failed.
 * @export
 * @class EncryptionFailedError
 * @extends {OperationalError}
 */
export class EncryptionFailedError extends OperationalError {
	constructor(message: string, type?: string) {
		super(message, type);
		this.statusCode = 500;
	}
}

/**
 * User not found.
 * @export
 * @class UserNotFound
 * @extends {OperationalError}
 */
export class UserNotFound extends OperationalError {
	constructor(message: string, type?: string) {
		super(message, type);
		this.statusCode = 401;
	}
}

/**
 * User update does not pass validation.
 * @export
 * @class UserValidationError
 * @extends {OperationalError}
 */
export class UserValidationError extends OperationalError {
	constructor(message: string, type?: string) {
		super(message, type);
		this.statusCode = 400;
	}
}
