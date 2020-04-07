import { schemaComposer } from "graphql-compose";

const NotificationTC = schemaComposer.createObjectTC({
	fields: {
		message: "String!",
		type: "NotificationType!"
	},
	name: "Notification"
});

export default NotificationTC;
