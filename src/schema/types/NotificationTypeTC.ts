import { schemaComposer } from "graphql-compose";

const NotificationTypeTC = schemaComposer.createEnumTC({
	name: "NotificationType",
	values: {
		ERROR: { value: "error" },
		INFO: { value: "info" },
		SUCCESS: { value: "success" },
		WARNING: { value: "warning" }
	}
});

export default NotificationTypeTC;
