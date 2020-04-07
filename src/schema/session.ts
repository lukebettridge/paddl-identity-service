import { Schema } from "mongoose";

const SessionSchema = {
	expiryDate: {
		isPublic: false,
		type: Date,
	},
	refreshToken: {
		isPublic: false,
		type: String,
	},
	userId: {
		type: Schema.Types.ObjectId,
	},
};

export { SessionSchema };
