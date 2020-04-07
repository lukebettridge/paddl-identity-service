import { composeWithMongoose } from "graphql-compose-mongoose";

import User from "../../models/User";
import { internalFields, privateFields } from "../user";

// Getting converted GraphQL public user fields from Mongoose schema
const UserPublicInfoTC = composeWithMongoose(User, {
	fields: {
		remove: [...internalFields, ...privateFields]
	},
	name: "UserPublicInfo"
});

export default UserPublicInfoTC;
