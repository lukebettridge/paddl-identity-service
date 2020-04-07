import { generateKeyPairSync } from "crypto";

/**
 * Generating rsa public and private keys.
 * @returns {{ publicKey: string; privateKey: string }}
 */
export default (): { publicKey: string; privateKey: string } => {
	const { publicKey, privateKey } = generateKeyPairSync("rsa", {
		modulusLength: 2048,
		privateKeyEncoding: {
			format: "pem",
			type: "pkcs8"
		},
		publicKeyEncoding: {
			format: "pem",
			type: "spki"
		}
	});
	return { publicKey, privateKey };
};
