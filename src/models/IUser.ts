import { Model } from "mongoose";

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
	 * Returns true if `password` is valid for the passed user
	 * @param  {any} user
	 * @param  {string} password
	 * @returns {Promise<boolean>} Promise to the result
	 */
	isPasswordValid(user: any, password: string): Promise<boolean>;

	/**
	 * Remove user selected by `filter`
	 * @param  {any} filter
	 * @returns {Promise<void>}
	 */
	removeUser(filter: any): Promise<void>;

	/**
	 * Sign user
	 * @param  {any} user
	 * @param  {string} privateKey
	 * @returns {Promise<{ expiryDate: Date; token: string }>} Promise to the authentication `token` and it's `expiryDate`
	 */
	sign(
		user: any,
		privateKey: string
	): Promise<{ expiryDate: Date; token: string }>;

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
