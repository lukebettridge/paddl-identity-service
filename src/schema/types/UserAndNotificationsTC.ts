import { schemaComposer } from "graphql-compose";

import NotificationTC from "./NotificationTC";
import UserTC from "./UserTC";

const UserAndNotificationsTC = schemaComposer.createObjectTC({
	fields: {
		notifications: [NotificationTC],
		user: UserTC
	},
	name: "UserAndNotifications"
});

export default UserAndNotificationsTC;
