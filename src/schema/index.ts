import { schemaComposer } from "graphql-compose";

import { authorization } from "../utils";
import { getPublicKey } from "../config/keys";
import * as UserController from "../controllers/user";
import * as types from "./types";

schemaComposer.Query.addFields({
	isEmailAvailable: {
		args: {
			email: "String!"
		},
		resolve: (_, { email }): Promise<boolean> =>
			UserController.isEmailAvailable(email),
		type: "Boolean!"
	},
	publicKey: {
		resolve: (): string => getPublicKey(),
		type: "String!"
	},
	...authorization({
		me: {
			resolve: ({ context: { req } }): Promise<{ user: any }> =>
				UserController.getUserById(req.user?._id),
			type: types.UserTC
		}
	})
});
schemaComposer.Mutation.addFields({
	login: {
		args: {
			email: "String!",
			password: "String!"
		},
		resolve: (
			_,
			{ email, password },
			{ req, res }
		): Promise<{ token: string; user: any }> =>
			UserController.login(email, password, req, res),
		type: types.UserAndTokenTC
	},
	refreshToken: {
		resolve: (
			_,
			{},
			{ req, res }
		): Promise<{ token: string; expiryDate: Date }> =>
			UserController.refreshTokens(req, res),
		type: types.TokenTC
	},
	register: {
		args: {
			fields: "UserCreateInput!"
		},
		resolve: (_, { fields }): Promise<{ user: any; notifications: any[] }> =>
			UserController.createUser(fields),
		type: types.NotificationsTC
	},
	...authorization(
		{
			updateMe: {
				args: {
					fields: "UserUpdateMeInput!"
				},
				resolve: ({
					args: { fields },
					context: { req }
				}): Promise<{ user: any; notifications: any[] }> => {
					fields._id = req.user?._id;
					return UserController.updateUser(fields);
				},
				type: types.UserAndNotificationsTC
			}
		},
		"readWrite"
	)
});

export default schemaComposer.buildSchema();
