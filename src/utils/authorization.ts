/* eslint-disable no-console */
import { schemaComposer } from "graphql-compose";

import { UserNotFound } from "../error/ErrorTypes";
import { getPublicKey } from "../config/keys";
import User from "../models/User";

const userHasRole = (user: any, requiredRole: string): boolean => {
	const roles = ["read", "readWrite", "userAdmin", "appAdmin"];
	return user.roles?.some(
		({ app, role }) =>
			app === "default" && roles.indexOf(role) >= roles.indexOf(requiredRole)
	);
};

export default (
	resolvers: any,
	role: "read" | "readWrite" | "userAdmin" | "appAdmin" = "read"
): object => {
	Object.keys(resolvers).forEach(k => {
		resolvers[k].name = k;
		resolvers[k] = schemaComposer
			.createResolver(resolvers[k])
			.wrapResolve(next => async (rp): Promise<any> => {
				const { req } = rp.context;
				const header = req.headers.authorization;

				if (typeof header !== "undefined") {
					const token = header.split(" ")[1];
					const userDecrypted = await User.verify(token, getPublicKey());
					const user = await User.getUser({ _id: userDecrypted._id });

					if (!userHasRole(user, role)) {
						throw new UserNotFound(
							"You are not authorized to perform this action"
						);
					}
					req.user = user;
				} else {
					throw new UserNotFound(
						"You must be logged in to perform this action"
					);
				}
				return next(rp);
			});
	});
	return resolvers;
};
