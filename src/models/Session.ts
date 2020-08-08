import { Document, model, Schema } from "mongoose";

import { ISessionModel } from "./ISession";
import { generateToken, getExpiryDate } from "../utils";
import { UnauthorizedError } from "../error/ErrorTypes";
import { SessionSchema } from "../schema/session";

const DEFAULT_REFRESH_TOKEN_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days

const Session: Schema = new Schema(SessionSchema, {
	collection: "sessions"
});

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
		throw new UnauthorizedError("Your session has expired, please login");
	}
};

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

Session.statics.removeSession = async function (
	userId: string,
	refreshToken: string
): Promise<any> {
	return await this.deleteOne({ userId, refreshToken });
};

Session.statics.removeOutdatedSessions = async function (
	userId: string
): Promise<any> {
	return await this.deleteMany({ userId, expiryDate: { $lt: new Date() } });
};

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
