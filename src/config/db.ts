/* eslint-disable no-console */
import mongoose from "mongoose";

const init = (cb?: () => any): void => {
	const {
		MONGO_USERNAME,
		MONGO_PASSWORD,
		MONGO_HOSTNAME,
		MONGO_PORT,
		MONGO_DB,
		MONGO_AUTHSOURCE,
		MONGO_REPLICASET
	} = process.env;

	if (cb) mongoose.connection.on("connected", cb);

	process.on("SIGINT", () => {
		mongoose.connection.close(() => {
			process.exit(0);
		});
	});

	let mongoUri = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=${
		MONGO_AUTHSOURCE || "admin"
	}`;
	if (MONGO_REPLICASET) mongoUri += `&replicaSet=${MONGO_REPLICASET}`;

	mongoose
		.connect(mongoUri, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		})
		.then(() => console.log("MongoDB successfully connected"))
		.catch((err) => console.log("MongoDB connection failed\n", err));
};

const close = (cb?: () => void): void => {
	mongoose.connection.close(cb);
};

export default { init, close };
