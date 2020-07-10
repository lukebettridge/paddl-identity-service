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
		isUneditable: true,
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
		isUneditable: true,
		type: Boolean
	}
};

/**
 * Fields that are private to users (e.g. email) and not shared with the public queries
 */
const privateFields: string[] = Object.keys(UserSchema).filter(
	(x) => !UserSchema[x].isPublic
);

/**
 * Fields that are internal to the system (like user password hash and salt)
 */
const internalFields: string[] = Object.keys(UserSchema).filter(
	(x) => UserSchema[x].isInternal
);

/**
 * Users can't change the value of these fields (like if the user is `active`)
 */
const uneditableFields: string[] = Object.keys(UserSchema).filter(
	(x) => UserSchema[x].isUneditable
);

export { internalFields, privateFields, uneditableFields, UserSchema };
