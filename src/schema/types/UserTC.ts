import { model, Schema } from "mongoose";
import { composeWithMongoose } from "graphql-compose-mongoose";

import UserPublicInfoTC from "./UserPublicInfoTC";
import { internalFields, UserSchema } from "../user";

const convertedPrivateFields = composeWithMongoose(
	model("mock", new Schema(UserSchema)),
	{
		fields: {
			remove: [...internalFields]
		}
	}
).getFields();

// User GraphQL Type with public and private fields - accessible by logged in user.
const UserTC = UserPublicInfoTC.clone("User");
UserTC.addFields(convertedPrivateFields);

export default UserTC;
