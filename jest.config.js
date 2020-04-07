module.exports = {
	moduleNameMapper: {
		"^@config/(.*)": "<rootDir>/src/config/$1",
		"^@controllers/(.*)": "<rootDir>/src/controllers/$1",
		"^@error/(.*)": "<rootDir>/src/error/$1",
		"^@models/(.*)": "<rootDir>/src/models/$1",
		"^@schema/(.*)": "<rootDir>/src/schema/$1",
		"^@utils/(.*)": "<rootDir>/src/utils/$1"
	},
	testEnvironment: "node",
	testRegex: "/tests/.*\\.(test|spec)?\\.(ts)$",
	transform: { "^.+\\.ts?$": "ts-jest" }
};
