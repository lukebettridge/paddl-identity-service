/* eslint-disable no-console */
import express from "express";
import cookieParser from "cookie-parser";
import graphqlHTTP from "express-graphql";
import playground from "graphql-playground-middleware-express";

require("dotenv").config();

import db from "./config/db";
import keys from "./config/keys";

import OperationalError from "./error/ErrorTypes";
import schema from "./schema";

declare global {
	namespace Express {
		export interface Request {
			user: any;
		}
	}
}

db.init();
keys.init();

const app = express();

if (process.env.NODE_ENV === "development") {
	app.get("/playground", playground({ endpoint: "/" }));
}

app.use(cookieParser());
app.use(
	"/",
	graphqlHTTP(async (req, res) => {
		return {
			context: { req, res },
			customFormatErrorFn: (err: Error): any => {
				// @ts-ignore
				const operationalError = err.originalError;
				if (operationalError instanceof OperationalError) {
					return {
						message: operationalError.message,
						statusCode: operationalError.statusCode,
						type: operationalError.type
					};
				} else {
					// @ts-ignore
					err.type = err.constructor.name;
					return err;
				}
			},
			graphiql: false,
			schema
		};
	})
);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server listening on port", PORT));
