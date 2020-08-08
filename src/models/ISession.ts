import { Model } from "mongoose";

export interface ISessionModel extends Model<any, {}> {
	/**
	 * Create a refresh token for the given user ID
	 * @param  {string} userId
	 * @returns {Promise<{refreshToken: string, expiryDate: Date}>} Returns the refresh token and it's expiry date
	 */
	createSession(
		userId: string
	): Promise<{ refreshToken: string; expiryDate: Date }>;

	/**
	 * Returns the user and session corresponding to the refresh token
	 * @throws {UnauthorizedError}
	 * @param  {string} userId
	 * @returns {Promise<any>} Returns the user and session corresponding to the refresh token
	 */
	getUserAndSessionFromRefreshToken(refreshToken: string): Promise<any>;

	/**
	 * Returns true if the refresh token exists for the given user ID
	 * @param  {string} userId
	 * @param  {string} refreshToken
	 * @returns {Promise<boolean>} Promise to the boolean result
	 */
	isValid(userId: string, refreshToken: string): Promise<boolean>;

	/**
	 * Remove the outdated refresh tokens for the given user ID
	 * @param  {string} userId
	 * @returns {Promise<any>}
	 */
	removeOutdatedSessions(userId: string): Promise<any>;

	/**
	 * Remove the refresh token for the given user ID
	 * @param  {string} userId
	 * @param  {string} refreshToken
	 * @returns {Promise<any>}
	 */
	removeSession(userId: string, refreshToken: string): Promise<any>;

	/**
	 * Update the refresh token by generating a new one with a new expiry date
	 * @param  {string} userId
	 * @param  {string} refreshToken
	 * @returns {Promise<{ refreshToken: string, expiryDate: Date }>} Returns the refresh token and it's expiry date
	 */
	updateSession(
		userId: string,
		refreshToken: string
	): Promise<{ refreshToken: string; expiryDate: Date }>;
}
