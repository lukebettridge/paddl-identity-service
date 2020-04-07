import { schemaComposer } from "graphql-compose";

const NotificationsTC = schemaComposer.createObjectTC({
	fields: {
		notifications: "[Notification]"
	},
	name: "Notifications"
});

export default NotificationsTC;
