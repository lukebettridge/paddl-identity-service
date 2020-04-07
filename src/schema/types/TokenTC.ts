import { schemaComposer } from "graphql-compose";

export default schemaComposer.createObjectTC({
	fields: {
		expiryDate: "Date!",
		token: "String!"
	},
	name: "Token"
});
