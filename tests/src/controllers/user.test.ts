import { Request } from "express";

import * as UserController from "@controllers/user";

describe("is user logged in", () => {
	it("returns true when user object is present", () => {
		const req = { user: { email: "foo" } };
		expect(UserController.isUserLoggedIn(req as Request)).toEqual(true);
	});

	[
		["missing", {}],
		["null", { user: null }],
		["undefined", { user: undefined }]
	].forEach(([scenario, req]) => {
		it(`returns false when user object is ${scenario}`, () => {
			expect(UserController.isUserLoggedIn(req as Request)).toEqual(false);
		});
	});
});
