import { Document, model, Model, Schema } from "mongoose";
import jwt from "jsonwebtoken";

import {
	escapeHtml,
	generateUserToken,
	getExpiryDate,
	passwordEncryption
} from "../utils";
import { InternalServerError, UnauthorizedError } from "../error/ErrorTypes";
import { internalFields, UserSchema } from "../schema/user";

const DEFAULT_AUTH_TOKEN_EXPIRY_TIME = 15 * 60 * 1000; // 15 minutes

const noninternalFieldsFilter: string =
	"-" + internalFields.filter((field) => field !== "roles").join(" -");
const internalFieldsMap: Map<string, boolean> = new Map();
internalFields.map((x) => internalFieldsMap.set(x, true));

export interface IUserModel extends Model<any> {
	/**
	 * Creates a user from `data`
	 * @throws {InternalServerError} Password encryption failed
	 * @param  {any} data
	 * @returns {Promise<any>}
	 */
	createUser(data: any): Promise<any>;

	/**
	 * Fetch user according to `filter`
	 * @throws {UnauthorizedError}
	 * @param  {any} filter
	 * @returns {Promise<any>} Promise to the user fetched
	 */
	getUser(filter: any): Promise<any>;

	/**
	 * Returns private and public user fields, user selected by `filter`
	 * @throws {UnauthorizedError}
	 * @param  {any} filter
	 * @returns {Promise<any>} Promise to the user fetched
	 */
	getUserNonInternalFields(filter: any): Promise<any>;

	/**
	 * Returns true if `password` is valid for the user selected by `filter`
	 * @param  {any} filter
	 * @param  {string} password
	 * @returns {Promise<boolean>} Promise to the result
	 */
	isPasswordValid(filter: any, password: string): Promise<boolean>;

	/**
	 * Returns a new authentication token. Should be called only after checking that user refresh token set within cookies is valid
	 * @param  {any} filter
	 * @param  {string} privateKey
	 * @returns {Promise<{ token: string; expiryDate: Date }>}
	 */
	refreshAuthToken(
		filter: any,
		privateKey: string
	): Promise<{ token: string; expiryDate: Date }>;

	/**
	 * Remove user selected by `filter`
	 * @param  {any} filter
	 * @returns {Promise<void>}
	 */
	removeUser(filter: any): Promise<void>;

	/**
	 * Sign user selected by `filter`
	 * @throws {UnauthorizedError}
	 * @param  {any} filter
	 * @param  {string} password
	 * @param  {string} privateKey
	 * @returns {Promise<{ user: any; token: string; expiryDate: Date }>} Promise to the `user` data, authentication `token` and it's `expiryDate`
	 */
	sign(
		filter: any,
		password: string,
		privateKey: string
	): Promise<{ user: any; token: string; expiryDate: Date }>;

	/**
	 * @throws {InternalServerError}
	 * Update user data selected by `filter`
	 * @param  {any} filter
	 * @param  {any} data
	 * @returns {Promise<void>}
	 */
	updateUser(filter: any, data: any): Promise<void>;

	/**
	 * Returns true if a user exists in the database according to `filter`
	 * @param  {any} filter
	 * @returns {Promise<boolean>} Promise to the boolean result
	 */
	userExists(filter: any): Promise<boolean>;

	/**
	 * Decrypt user authentication token with the `publicKey`
	 * Returns the user data decrypted
	 * @throws {UnauthorizedError} Token not valid
	 * @param  {string} token
	 * @param  {string} publicKey
	 * @returns {Promise<object | string>} Promise to the user data decrypted
	 */
	verify(token: string, publicKey: string): Promise<any>;
}

const User: Schema = new Schema(UserSchema, {
	collection: "users"
});

/** @see {@link UserModel#createUser} */
User.statics.createUser = async function (data: any): Promise<void> {
	const UserInstance = model("user", User);

	return passwordEncryption.hashAndSalt(data.password).then(
		(results) => {
			const user: any = new UserInstance();

			Object.keys(data).map((prop) => {
				if (prop !== "password") {
					if (internalFieldsMap.has(prop)) {
						user[prop] = data[prop];
					} else {
						user[prop] = escapeHtml(data[prop]);
					}
				}
			});
			user.password = results.hash;
			user.passwordSalt = results.salt;

			return user.save();
		},
		(err) => {
			throw new InternalServerError("Password encryption failed :" + err);
		}
	);
};

/** @see {@link UserModel#getUser} */
User.statics.getUser = async function (filter: any): Promise<any> {
	return this.findOne(filter).then((user: any) => {
		if (user === null) throw new UnauthorizedError("User could not be found");
		return user;
	});
};

/** @see {@link UserModel#getUserNonInternalFields} */
User.statics.getUserNonInternalFields = async function (
	filter: any
): Promise<any> {
	return this.findOne(filter)
		.select(noninternalFieldsFilter)
		.lean()
		.then((user: any) => {
			if (user === null) {
				throw new UnauthorizedError("User could not be found");
			}
			return user;
		});
};

/** @see {@link UserModel#isPasswordValid} */
User.statics.isPasswordValid = async function (
	filter: any,
	password: string
): Promise<boolean> {
	let user: any;
	return this.getUser(filter)
		.then((userFound: any) => {
			user = userFound;
			return passwordEncryption.hash(password, user.passwordSalt);
		})
		.then((results: any) => {
			return results.hash === user.password;
		});
};

/** @see {@link IUserModel#refreshAuthToken} */
User.statics.refreshAuthToken = async function (
	filter: any,
	privateKey: string
): Promise<{ token: string; expiryDate: Date }> {
	const authTokenExpiryTime =
		parseInt(process.env.AUTH_TOKEN_EXPIRY_TIME) ||
		DEFAULT_AUTH_TOKEN_EXPIRY_TIME;
	const user = await this.getUserNonInternalFields(filter);

	const expiryDate = getExpiryDate(authTokenExpiryTime);
	const token = await generateUserToken(user, privateKey, authTokenExpiryTime);

	return { token, expiryDate };
};

/** @see {@link UserModel#removeUser} */
User.statics.removeUser = function (filter: any): Promise<void> {
	return this.deleteOne(filter);
};

/** @see {@link IUserModel#sign} */
User.statics.sign = async function (
	filter: any,
	password: string,
	privateKey: string
): Promise<{ user: any; token: string; expiryDate: Date }> {
	const isPasswordValid = await this.isPasswordValid(filter, password);
	if (!isPasswordValid)
		throw new UnauthorizedError("The credentials you provided were incorrect");

	const authTokenExpiryTime =
		parseInt(process.env.AUTH_TOKEN_EXPIRY_TIME) ||
		DEFAULT_AUTH_TOKEN_EXPIRY_TIME;
	const user = await this.getUserNonInternalFields(filter);

	const expiryDate = getExpiryDate(authTokenExpiryTime);
	const token = await generateUserToken(user, privateKey, authTokenExpiryTime);

	return { user, token, expiryDate };
};

/** @see {@link UserModel#updateUser} */
User.statics.updateUser = async function (
	filter: any,
	data: any
): Promise<void> {
	if (data.password) {
		try {
			const results = await passwordEncryption.hashAndSalt(data.password);
			data = {
				...data,
				password: results.hash,
				passwordSalt: results.salt
			};
		} catch (err) {
			throw new InternalServerError("Password encryption failed :" + err);
		}
	}

	Object.keys(data).map((prop) => {
		if (!internalFieldsMap.has(prop)) {
			data[prop] = escapeHtml(data[prop]);
		}
	});

	await this.updateOne(filter, data, { runValidators: true });
};

/** @see {@link UserModel#userExists} */
User.statics.userExists = async function (filter: any): Promise<boolean> {
	return this.findOne(filter).then((result: any) => !!result);
};

/** @see {@link UserModel#verify} */
User.statics.verify = function (
	token: string,
	publicKey: string
): Promise<any> {
	return new Promise((resolve, reject) => {
		jwt.verify(
			token,
			publicKey,
			{ algorithms: ["RS256"] },
			async (err, userDecrypted) => {
				if (err)
					reject(
						new UnauthorizedError("There was an error verifying your session")
					);
				else resolve(userDecrypted);
			}
		);
	});
};

const UserModel = model<Document, IUserModel>("User", User);

export default UserModel;
