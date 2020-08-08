import { Document, model, Schema } from "mongoose";
import jwt from "jsonwebtoken";

import { IUserModel } from "./IUser";
import {
	escapeHtml,
	generateUserToken,
	getExpiryDate,
	passwordEncryption
} from "../utils";
import { InternalServerError, UnauthorizedError } from "../error/ErrorTypes";
import { internalFields, UserSchema } from "../schema/user";

const DEFAULT_AUTH_TOKEN_EXPIRY_TIME = 15 * 60 * 1000; // 15 minutes

const noninternalFieldsFilter: string =
	"-" + internalFields.filter((field) => field !== "roles").join(" -");
const internalFieldsMap: Map<string, boolean> = new Map();
internalFields.map((x) => internalFieldsMap.set(x, true));

const User: Schema = new Schema(UserSchema, {
	collection: "users"
});

User.statics.createUser = async function (data: any): Promise<void> {
	const UserInstance = model("user", User);

	return passwordEncryption.hashAndSalt(data.password).then(
		(results) => {
			const user: any = new UserInstance();

			Object.keys(data).map((prop) => {
				if (prop !== "password") {
					if (internalFieldsMap.has(prop)) {
						user[prop] = data[prop];
					} else {
						user[prop] = escapeHtml(data[prop]);
					}
				}
			});
			user.password = results.hash;
			user.passwordSalt = results.salt;

			return user.save();
		},
		(err) => {
			throw new InternalServerError("Password encryption failed :" + err);
		}
	);
};

User.statics.getUser = async function (filter: any): Promise<any> {
	return this.findOne(filter)
		.lean()
		.then((user: any) => {
			return user;
		});
};

User.statics.getUserNonInternalFields = async function (
	filter: any
): Promise<any> {
	return this.findOne(filter)
		.select(noninternalFieldsFilter)
		.lean()
		.then((user: any) => {
			if (user === null) {
				throw new UnauthorizedError("User could not be found");
			}
			return user;
		});
};

User.statics.isPasswordValid = async function (
	user: any,
	password: string
): Promise<boolean> {
	return passwordEncryption
		.hash(password, user.passwordSalt)
		.then((results: any) => results.hash === user.password);
};

User.statics.removeUser = function (filter: any): Promise<void> {
	return this.deleteOne(filter);
};

User.statics.sign = async function (
	user: any,
	privateKey: string
): Promise<{ expiryDate: Date; token: string }> {
	const authTokenExpiryTime =
		parseInt(process.env.AUTH_TOKEN_EXPIRY_TIME) ||
		DEFAULT_AUTH_TOKEN_EXPIRY_TIME;

	const expiryDate = getExpiryDate(authTokenExpiryTime);
	const token = await generateUserToken(user, privateKey, authTokenExpiryTime);

	return { expiryDate, token };
};

User.statics.updateUser = async function (
	filter: any,
	data: any
): Promise<void> {
	if (data.password) {
		try {
			const results = await passwordEncryption.hashAndSalt(data.password);
			data = {
				...data,
				password: results.hash,
				passwordSalt: results.salt
			};
		} catch (err) {
			throw new InternalServerError("Password encryption failed :" + err);
		}
	}

	Object.keys(data).map((prop) => {
		if (!internalFieldsMap.has(prop)) {
			data[prop] = escapeHtml(data[prop]);
		}
	});

	await this.updateOne(filter, data, { runValidators: true });
};

User.statics.userExists = async function (filter: any): Promise<boolean> {
	return this.findOne(filter).then((result: any) => !!result);
};

User.statics.verify = function (
	token: string,
	publicKey: string
): Promise<any> {
	return new Promise((resolve, reject) => {
		jwt.verify(
			token,
			publicKey,
			{ algorithms: ["RS256"] },
			async (err, userDecrypted) => {
				if (err)
					reject(
						new UnauthorizedError("There was an error verifying your session")
					);
				else resolve(userDecrypted);
			}
		);
	});
};

const UserModel = model<Document, IUserModel>("User", User);

export default UserModel;
