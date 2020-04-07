import jwt from "jsonwebtoken";

import { UserNotFound } from "../error/ErrorTypes";

/**
 * Generaet users JWT encoding the `user` data with the `privateKey`. This authentication token will be valid for `expiresIn` number of milliseconds.
 * @param  {any} user
 * @param  {string} privateKey
 * @param  {number} expiresIn
 * @returns {Promise<string>} Promise to the token.
 */
export default (
	user: any,
	privateKey: string,
	expiresIn: number
): Promise<string> => {
	return new Promise((resolve, reject) => {
		jwt.sign(
			user,
			privateKey,
			{
				algorithm: "RS256",
				expiresIn: expiresIn + "ms"
			},
			async (err, token) => {
				if (err) {
					reject(new UserNotFound(err.message));
				} else {
					resolve(token);
				}
			}
		);
	});
};
