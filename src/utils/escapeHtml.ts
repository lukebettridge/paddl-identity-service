/**
 * Escape unsafe string from HTML injection to protect users from XSS attacks
 * @param  {string} unsafe
 * @returns {string} Safe string
 */
export default (unsafe: string): string => {
	if (typeof unsafe !== "string") {
		return unsafe;
	} else {
		return unsafe
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}
};
