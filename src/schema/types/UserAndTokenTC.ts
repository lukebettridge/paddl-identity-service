import { schemaComposer } from "graphql-compose";

import UserTC from "./UserTC";

const UserAndTokenTC = schemaComposer.createObjectTC({
	fields: {
		expiryDate: "Date!",
		token: "String!",
		user: UserTC
	},
	name: "UserAndToken"
});

export default UserAndTokenTC;
