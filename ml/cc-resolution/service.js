import * as tf from "@tensorflow/tfjs-node"

import * as use from "@tensorflow-models/universal-sentence-encoder"

export const resolutionStatuses = {
	1: [
		"ADOPTED",
		"REFERRED",
		"FILED",
		"TABLED",
		"CONFIRMED",
		"ORDAINED",
		"HEARING",
		"ADVERTISED",
		"RECOMMITTED",
		"ACCEPTED",
		"NONE",
		"DENIED"
	]
}

/** @type {use.UniversalSentenceEncoder} */
let embeddingModel;

export async function init() {
	const m = await use.load()

	embeddingModel = m
}

/**
 * @param {number} modelVersion
 * @param {string} text
 * @param {number} [threshold]
 * @return Promise<string>
 */
export async function predictResolution(modelVersion, text, threshold = 0.99) {
	if (!(modelVersion in resolutionStatuses)) {
		throw new Error("model version " + modelVersion + " not supported")
	}
	console.log("hello!")
	const modelPath = `file://${process.env.CC_RESOLUTION_MODEL_PATH}`
	const model = tf.loadLayersModel(modelPath)
	const testData = await embeddingModel.embed(text)
	const prediction = (await model).predict(testData)
	const result = await prediction.data()

	const index = result.findIndex(
		(el) => el > threshold
	)

	console.log({result, index})

	if (index === -1) {
		return "";
	}

	return resolutionStatuses[modelVersion][index]
}
