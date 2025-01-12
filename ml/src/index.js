import { inflate } from "node:zlib"

import express from "express"

import {
	init,
	predictResolution
} from "../cc-resolution/service.js"

const DEFAULT_PORT = 8101

/** @param {string} [input] */
const b64gzipToText = async (input) => {
	console.log(input)
	return input
}

const app = express()

app.get("/api/*/:item", async (req, _res, next) => {
	const text = await b64gzipToText(req.params["item"])
	req.locals = {
		...req.locals,
		item: text
	}

	next()
})

app.get("/api/cc-item-resolution/*", async (req, res) => {
	const text = await b64gzipToText(req.locals["item"])
	console.log(`->`, text)
	const result = await predictResolution(1, text)
	console.log("result:", result)
	res.send({
		model: "cc-resolution",
		modelVersion: 1,
		result
	})
})

async function go() {
	await init()

	let server = app.listen(process.env.PORT ?? DEFAULT_PORT, () => {
		console.log(`listening on ${server.address().port}`)
	})
}

go()
