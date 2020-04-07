import mongoose from "mongoose";

import db from "@config/db";

const promise = { then: jest.fn(), catch: jest.fn() };
jest.mock("mongoose", () => ({
	connect: jest.fn(),
	connection: {
		on: jest.fn(),
		close: jest.fn()
	}
}));

describe("database initialization", () => {
	beforeEach(() => {
		jest.resetAllMocks();

		global.console.log = jest.fn();
		global.process.exit = jest.fn<never, never>();
		global.process.on = jest.fn();
		global.process.env = {
			MONGO_USERNAME: "user",
			MONGO_PASSWORD: "foo",
			MONGO_HOSTNAME: "127.0.0.1",
			MONGO_PORT: "27017",
			MONGO_DB: "database"
		};

		promise.then.mockReturnValue(promise);
		(mongoose.connect as jest.Mock).mockReturnValue(promise);
	});

	it("sets mongoose on connected callback", () => {
		const callback = jest.fn();
		db.init(callback);
		expect(mongoose.connection.on).toHaveBeenCalledWith("connected", callback);
	});

	it("sets node on process end callback", () => {
		db.init();
		expect(global.process.on).toHaveBeenCalledWith(
			"SIGINT",
			expect.any(Function)
		);
	});

	it("sets mongoose on disconnect callback", () => {
		db.init();
		(process.on as jest.Mock).mock.calls[0][1]();
		expect(mongoose.connection.close).toHaveBeenCalledWith(
			expect.any(Function)
		);
	});

	it("calls process exit on mongoose disconnect", () => {
		db.init();
		(process.on as jest.Mock).mock.calls[0][1]();
		(mongoose.connection.close as jest.Mock).mock.calls[0][0]();
		expect(global.process.exit).toHaveBeenCalledWith(0);
	});

	["minimum URI", "an auth source", "a replica set", "all options"].forEach(
		(scenario, index) => {
			it(`opens a mongoose connection with ${scenario}`, () => {
				let uri: string;
				switch (index) {
					case 1:
						uri = "mongodb://user:foo@127.0.0.1:27017/database?authSource=bar";
						global.process.env.MONGO_AUTHSOURCE = "bar";
						break;
					case 2:
						uri =
							"mongodb://user:foo@127.0.0.1:27017/database?authSource=admin&replicaSet=db";
						global.process.env.MONGO_REPLICASET = "db";
						break;
					case 3:
						uri =
							"mongodb://user:foo@127.0.0.1:27017/database?authSource=bar&replicaSet=db";
						global.process.env.MONGO_AUTHSOURCE = "bar";
						global.process.env.MONGO_REPLICASET = "db";
						break;
					default:
						uri =
							"mongodb://user:foo@127.0.0.1:27017/database?authSource=admin";
				}

				db.init();
				expect(mongoose.connect).toHaveBeenCalledWith(uri, {
					useNewUrlParser: true,
					useUnifiedTopology: true
				});
			});
		}
	);

	it("fulfills mongoose connect promise", () => {
		db.init();
		promise.then.mock.calls[0][0]();
		expect(global.console.log).toHaveBeenCalledWith(
			"MongoDB successfully connected"
		);
	});

	it("rejects mongoose connect promise", () => {
		db.init();
		promise.catch.mock.calls[0][0]("error");
		expect(global.console.log).toHaveBeenCalledWith(
			"MongoDB connection failed\n",
			"error"
		);
	});
});

describe("database termination", () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it("closes mongoose connection", () => {
		db.close();
		expect(mongoose.connection.close).toHaveBeenCalled();
	});

	it("closes mongoose connection with callback", () => {
		const callback = jest.fn();
		db.close(callback);
		expect(mongoose.connection.close).toHaveBeenCalledWith(callback);
	});
});
