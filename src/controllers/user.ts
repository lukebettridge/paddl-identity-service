import { Request, Response } from "express";

import { getPrivateKey } from "../config/keys";
import {
	ForbiddenError,
	UnauthorizedError,
	BadRequestError
} from "../error/ErrorTypes";
import Session from "../models/Session";
import User from "../models/User";

interface Notification {
	type: string;
	message: string;
}

/**
 * Returns true if user issuing the request is logged in
 * @param  {Request} req
 * @returns {boolean} User is logged in
 */
export const isUserLoggedIn = (req: Request): boolean => !!req.user;

/**
 * Returns true if email is not already taken by another user
 * @param  {string} email
 * @returns {Promise<boolean>} Promise to boolean result
 */
export const isEmailAvailable = async (email: string): Promise<boolean> =>
	!(await User.userExists({ email }));

/**
 * Creates a new user
 * @throws {ForbiddenError}
 * @throws {BadRequestError}
 * @param  {any} user
 * @returns {Promise<{ user: any; notifications: Notification[] }>} Promise to new user data and notifications
 */
export const createUser = async (
	user: any
): Promise<{ user: any; notifications: Notification[] }> => {
	const notifications: Notification[] = [];

	if (!user.password) {
		throw new BadRequestError("Password is a required field");
	}

	if (user.password.length < 8) {
		throw new BadRequestError("Password must contain at least 8 characters");
	}
	try {
		await User.createUser(user);
		notifications.push({
			type: "success",
			message: "The user was created successfully"
		});
		return { notifications, user };
	} catch (err) {
		if (
			err.message.includes("email") &&
			err.message.includes("duplicate key")
		) {
			throw new ForbiddenError(
				"An account already exists with the email address you provided"
			);
		}
		throw new BadRequestError(
			err.message.replace("user validation failed: email: Path ", "")
		);
	}
};

/**
 * Returns the user data for a given ID
 * @throws {UnauthorizedError} User does not exist
 * @param  {string} userId
 * @returns {Promise<{ user: any }>} Promise to user data
 */
export const getUserById = async (userId: string): Promise<{ user: any }> => {
	try {
		return await User.getUserNonInternalFields({ _id: userId });
	} catch (err) {
		throw new UnauthorizedError("User could not be found");
	}
};

/**
 * Authenticates a user
 * @throws {UnauthorizedError} User suspended or does not exist
 * @param  {string} email
 * @param  {string} password
 * @param  {Request} req
 * @param  {Response} res
 * @returns {Promise<{ token: string; user: any }>} Promise to auth token and user data
 */
export const login = async (
	email: string,
	password: string,
	req: Request,
	res: Response
): Promise<{ token: string; user: any }> => {
	const emailExists = await User.userExists({ email });
	if (!emailExists) {
		throw new UnauthorizedError("The credentials you provided were incorrect");
	} else {
		const user = await User.getUser({ email });
		if (!user.active) {
			throw new UnauthorizedError(
				"This user account has not been activated by an administrator"
			);
		}
	}
	const payload = await User.sign({ email: email }, password, getPrivateKey());

	if (req.cookies?.refreshToken) {
		await Session.removeSession(payload.user._id, req.cookies.refreshToken);
	}
	await Session.removeOutdatedSessions(payload.user._id);

	const { refreshToken } = await Session.createSession(payload.user._id);
	res.cookie("refreshToken", refreshToken, { httpOnly: true });
	return payload;
};

/**
 * Refresh the auth token and the refresh token
 * @throws {UnauthorizedError} User is suspended or refresh token has expired
 * @param  {Request} req
 * @param  {Response} res
 * @returns {Promise<{ token: string; expiryDate: Date }>} Promise to new auth token and expiry date
 */
export const refreshTokens = async (
	req: Request,
	res: Response
): Promise<{ token: string; expiryDate: Date }> => {
	const now = new Date();
	const { user, session } = await Session.getUserAndSessionFromRefreshToken(
		req.cookies.refreshToken
	);

	if (user && session && now.getTime() < session.expiryDate) {
		if (!user.active) {
			throw new UnauthorizedError(
				"This user account has not been activated by an administrator"
			);
		}

		const payload = await User.refreshAuthToken(
			{ _id: user._id },
			getPrivateKey()
		);

		// Generate a new refresh token and invalidate the old one
		const { refreshToken } = await Session.updateSession(
			user._id,
			session.refreshToken
		);
		res.cookie("refreshToken", refreshToken, { httpOnly: true });

		return payload;
	} else {
		// Refresh token has expired
		throw new UnauthorizedError("Your session has expired, please login");
	}
};

/**
 * Update the user data for a given ID
 * @throws {UnauthorizedError} User does not exist
 * @throws {ForbiddenError}
 * @throws {BadRequestError}
 * @param  {any} user
 * @returns {Promise<{ user: any; notifications: Notification[] }>} Promise to user data and notifications
 */
export const updateUser = async (
	user: any
): Promise<{ user: any; notifications: Notification[] }> => {
	const notifications = [];
	try {
		const exists = await User.userExists({ _id: user._id });
		if (!exists) {
			throw new UnauthorizedError("User could not be found");
		}

		await User.updateUser({ _id: user._id }, user);
		user = await User.getUserNonInternalFields({ _id: user._id });

		notifications.push({
			type: "success",
			message: "The user was updated successfully"
		});
		return { notifications, user };
	} catch (err) {
		if (
			err.message.includes("email") &&
			err.message.includes("duplicate key")
		) {
			throw new ForbiddenError(
				"An account already exists with the email address you provided"
			);
		}
		throw new BadRequestError(
			err.message.replace("user validation failed: email: ", "")
		);
	}
};
