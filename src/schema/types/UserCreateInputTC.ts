import { schemaComposer } from "graphql-compose";

import UserTC from "./UserTC";
import { uneditableFields } from "../user";

const UserCreateInputTC = schemaComposer.createInputTC("UserCreateInput");
// @ts-ignore
UserCreateInputTC.addFields(UserTC.getFields());
UserCreateInputTC.addFields({
	password: "String!"
});
UserCreateInputTC.removeField([...uneditableFields, "_id"]);

export default UserCreateInputTC;
