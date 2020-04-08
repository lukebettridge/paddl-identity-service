const UserSchema = {
	forename: {
		isPublic: false,
		required: true,
		trim: true,
		type: String
	},
	surname: {
		isPublic: false,
		required: true,
		trim: true,
		type: String
	},
	gender: {
		enum: ["male", "female"],
		isPublic: false,
		type: String
	},
	email: {
		isPublic: false,
		lowercase: true,
		required: true,
		trim: true,
		type: String,
		unique: true
	},
	password: {
		isInternal: true,
		isPublic: false,
		required: true,
		type: String
	},
	passwordRecoveryToken: {
		isInternal: true,
		isPublic: false,
		sparse: true,
		type: String,
		unique: true
	},
	passwordSalt: {
		isInternal: true,
		isPublic: false,
		required: true,
		type: String
	},
	roles: {
		default: [{ app: "default", role: "read" }],
		isInternal: true,
		isPublic: false,
		required: true,
		type: [
			{
				app: String,
				role: {
					type: String,
					enum: ["read", "readWrite", "userAdmin", "appAdmin"]
				}
			}
		]
	},
	active: {
		default: false,
		isInternal: true,
		isPublic: false,
		type: Boolean
	}
};

/**
 * List of private fields. Fields that are private to users (like email address) and not shared with the public queries (`userById`, `userMany`...) of the API .
 */
const privateFields: string[] = Object.keys(UserSchema).filter(
	(x) => !UserSchema[x].isPublic
);

/**
 * List of internal fields. Fields that are internal to the system, nobody can access it (like user password hash and salt).
 */
const internalFields: string[] = Object.keys(UserSchema).filter(
	(x) => UserSchema[x].isInternal
);

/**
 * List of uneditable fields. Users can't change the value of those fields (like if the user is `verified`)
 */
const uneditableFields: string[] = Object.keys(UserSchema).filter(
	(x) => UserSchema[x].isUneditable
);

export { internalFields, privateFields, uneditableFields, UserSchema };
