import crypto from "crypto";

/**
 * Return a token of size `tokenLength`.
 * @param  {number} [tokenLength]
 * @returns {string} token generated
 */
export default (tokenLength?: number): string => {
	tokenLength =
		tokenLength || parseInt(process.env.REFRESH_TOKEN_LENGTH) || 256;
	return crypto.randomBytes(tokenLength).toString("hex");
};
