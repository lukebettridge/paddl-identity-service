import fs from "fs";
import path from "path";

import { generateKeys } from "../utils";

const DEFAULT_PUBLIC_KEY_FILE = __dirname.includes("config")
	? path.resolve(__dirname, "../../public-key.txt")
	: path.resolve(__dirname, "../public-key.txt");
const DEFAULT_PRIVATE_KEY_FILE = __dirname.includes("config")
	? path.resolve(__dirname, "../../private-key.txt")
	: path.resolve(__dirname, "../private-key.txt");

export const getPublicKey = (): string =>
	fs.readFileSync(DEFAULT_PUBLIC_KEY_FILE).toString();
export const getPrivateKey = (): string =>
	fs.readFileSync(DEFAULT_PRIVATE_KEY_FILE).toString();

const writeKeysToFile = (): void => {
	const { publicKey, privateKey } = generateKeys();

	fs.writeFileSync(DEFAULT_PUBLIC_KEY_FILE, publicKey);
	fs.writeFileSync(DEFAULT_PRIVATE_KEY_FILE, privateKey);
	fs.chmodSync(DEFAULT_PRIVATE_KEY_FILE, 0o400);
};

const init = (): void => {
	if (
		!fs.existsSync(DEFAULT_PUBLIC_KEY_FILE) ||
		!fs.existsSync(DEFAULT_PRIVATE_KEY_FILE)
	) {
		writeKeysToFile();
	}
};

export default { init };
