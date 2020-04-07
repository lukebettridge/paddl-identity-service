/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
	entry: "./src/index.ts",
	externals: [nodeExternals()],
	module: {
		rules: [
			{
				test: /\.(ts)$/,
				use: ["ts-loader"]
			}
		]
	},
	mode: process.env.NODE_ENV,
	node: {
		__dirname: false
	},
	output: {
		path: path.resolve(__dirname, "build"),
		filename: "index.js"
	},
	resolve: {
		alias: {
			"@config": path.resolve(__dirname, "src/config/"),
			"@controllers": path.resolve(__dirname, "src/controllers/"),
			"@error": path.resolve(__dirname, "src/error/"),
			"@models": path.resolve(__dirname, "src/models/"),
			"@schema": path.resolve(__dirname, "src/schema/"),
			"@utils": path.resolve(__dirname, "src/utils/")
		},
		extensions: [".ts", ".js"]
	},
	target: "node"
};
