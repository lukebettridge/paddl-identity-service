import { schemaComposer } from "graphql-compose";

import UserTC from "./UserTC";
import { uneditableFields } from "../user";

const UserUpdateMeInputTC = schemaComposer.createInputTC("UserUpdateMeInput");
// @ts-ignore
UserUpdateMeInputTC.addFields(UserTC.getFields());
UserUpdateMeInputTC.addFields({
	password: "String"
});
UserUpdateMeInputTC.removeField([...uneditableFields, "_id", "active"]);

export default UserUpdateMeInputTC;
