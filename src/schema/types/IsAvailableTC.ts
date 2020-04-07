import { schemaComposer } from "graphql-compose";

const IsAvailableTC = schemaComposer.createObjectTC({
	fields: {
		isAvailable: "Boolean!"
	},
	name: "IsAvailable"
});

export default IsAvailableTC;
