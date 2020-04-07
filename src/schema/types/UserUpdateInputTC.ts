import { schemaComposer } from "graphql-compose";

import UserTC from "./UserTC";
import { uneditableFields } from "../user";

const UserUpdateInputTC = schemaComposer.createInputTC("UserUpdateInput");
// @ts-ignore
UserUpdateInputTC.addFields(UserTC.getFields());
UserUpdateInputTC.removeField([...uneditableFields]);

export default UserUpdateInputTC;
