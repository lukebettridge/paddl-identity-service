import { Document, model, Model, Schema } from "mongoose";

import { generateToken, getExpiryDate } from "../utils";
import { UserNotFound } from "../error/ErrorTypes";
import { SessionSchema } from "../schema/session";

const DEFAULT_REFRESH_TOKEN_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface ISessionModel extends Model<any, {}> {
	/**
	 * Create a refresh token for the given user ID.
	 * @param  {string} userId
	 * @returns {Promise<{refreshToken: string, expiryDate: Date}>} Returns the refresh token and its expiry date
	 */
	createSession(
		userId: string
	): Promise<{ refreshToken: string; expiryDate: Date }>;

	/**
	 * Returns the user and session corresponding to the refresh token.
	 * @throws {UserNotFound}
	 * @param  {string} userId
	 * @returns {Promise<any>} Returns the user and session corresponding to the refresh token.
	 */
	getUserAndSessionFromRefreshToken(refreshToken: string): Promise<any>;

	/**
	 * Retruns true if the refresh token exists for the given user ID.
	 * @param  {string} userId
	 * @param  {string} refreshToken
	 * @returns {Promise<boolean>} Promise to the boolean result
	 */
	isValid(userId: string, refreshToken: string): Promise<boolean>;

	/**
	 * Remove the outdated refresh tokens for the given user ID
	 * @param  {string} userId
	 * @returns {Promise<void>}
	 */
	removeOutdatedSessions(userId: string): Promise<any>;

	/**
	 * Remove the refresh token for the given user ID
	 * @param  {string} userId
	 * @param  {string} refreshToken
	 * @returns {Promise<void>}
	 */
	removeSession(userId: string, refreshToken: string): Promise<any>;

	/**
	 * Update the refresh token by generating a new one with a new expiry date
	 * @param  {string} userId
	 * @param  {string} refreshToken
	 * @returns {Promise<{ refreshToken: string, expiryDate: Date }>} Returns the refresh token and its expiry date
	 */
	updateSession(
		userId: string,
		refreshToken: string
	): Promise<{ refreshToken: string; expiryDate: Date }>;
}

const Session: Schema = new Schema(SessionSchema, {
	collection: "sessions"
});

/** @see {@link SessionModel#createSession} */
Session.statics.createSession = async function (
	userId: string
): Promise<{ refreshToken: string; expiryDate: Date }> {
	const refreshTokenExpiryTime =
		parseInt(process.env.REFRESH_TOKEN_EXPIRY_TIME) ||
		DEFAULT_REFRESH_TOKEN_EXPIRY_TIME;
	const SessionInstance = model<Document, ISessionModel>("Session", Session);

	const session = new SessionInstance();
	session.refreshToken = generateToken();
	session.expiryDate = getExpiryDate(refreshTokenExpiryTime);
	session.userId = userId;

	await session.save();

	return { refreshToken: session.refreshToken, expiryDate: session.expiryDate };
};

/** @see {@link ISessionModel#getUserAndSessionFromRefreshToken} */
Session.statics.getUserAndSessionFromRefreshToken = async function (
	refreshToken: string
): Promise<{ session: any; user: any }> {
	const aggregate = await this.aggregate([
		{ $match: { refreshToken } },
		{
			$lookup: {
				as: "user",
				foreignField: "_id",
				from: "users",
				localField: "userId"
			}
		}
	]);

	if (
		aggregate &&
		aggregate.length > 0 &&
		aggregate[0].user &&
		aggregate[0].user.length > 0 &&
		aggregate[0].user[0]
	) {
		return { user: aggregate[0].user[0], session: aggregate[0] };
	} else {
		throw new UserNotFound("Please login!");
	}
};

/** @see {@link SessionModel#isValid} */
Session.statics.isValid = async function (
	userId: string,
	refreshToken: string
): Promise<boolean> {
	if (userId && refreshToken) {
		const session = await this.findOne({ userId, refreshToken });
		return !!session && session.expiryDate > new Date();
	} else {
		return false;
	}
};

/** @see {@link SessionModel#removeSession} */
Session.statics.removeSession = async function (
	userId: string,
	refreshToken: string
): Promise<any> {
	return await this.deleteOne({ userId, refreshToken });
};

/** @see {@link SessionModel#removeOutdatedSessions} */
Session.statics.removeOutdatedSessions = async function (
	userId: string
): Promise<any> {
	return await this.deleteMany({ userId, expiryDate: { $lt: new Date() } });
};

/** @see {@link SessionModel#updateSession} */
Session.statics.updateSession = async function (
	userId: string,
	refreshToken: string
): Promise<{ refreshToken: string; expiryDate: Date }> {
	const refreshTokenExpiryTime =
		parseInt(process.env.REFRESH_TOKEN_EXPIRY_TIME) ||
		DEFAULT_REFRESH_TOKEN_EXPIRY_TIME;
	const data = {
		expiryDate: getExpiryDate(refreshTokenExpiryTime),
		refreshToken: generateToken()
	};
	await this.updateOne({ userId, refreshToken }, data, { runValidators: true });
	return data;
};

const SessionModel = model<Document, ISessionModel>("Session", Session);

export default SessionModel;
