/**
 * Returns the expiry date of a new token from now onwards.
 * @returns {Date}
 */
export default (expiresIn: number): Date => {
	const expiryDate = new Date();
	expiryDate.setTime(expiryDate.getTime() + expiresIn);
	return expiryDate;
};
