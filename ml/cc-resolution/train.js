import path from "node:path"

import tf from "@tensorflow/tfjs-node"
import c2j from "csvtojson"

/**
 * @typedef {Object} ResolutionCSVRow
 * @property {String} itemNumber
 * @property {String} resolutionText
 * @property {String} resolutionStatus
 */

// TODO: define stuff like this as JSON Schema and use json-schema-to-zod
const resolutions = [
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

async function encodeDataset(datapoints) {
	return use.load()
		.then((model) => model.embed(datapoints))
}

/**
 * @param {ResolutionCSVRow[]} array
 * @return {ResolutionCSVRow[]}
 */
function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

	return array
}

/**
 * @param {ResolutionCSVRow[]} data
 */
function preprocessData(data) {
	return data
		.filter((el) => !!el.resolutionStatus)
		.map((el) => ({
			...el,
			resolutionText: el.resolutionText
				.toLowerCase()
				.trim()
		}))
}

async function go() {
	/** @type ResolutionCSVRow[] */
	const dataSeptember = (await c2j().fromFile(
		path.resolve(import.meta.dirname, "../../model-data/20240910v1.csv")
	))
	/** @type ResolutionCSVRow[] */
	const dataAugust = (await c2j().fromFile(
		path.resolve(import.meta.dirname, "../../model-data/20240827v1.csv")
	))
	/** @type ResolutionCSVRow[] */
	const dataJuly = (await c2j().fromFile(
		path.resolve(import.meta.dirname, "../../model-data/20240716v1.csv")
	))
	/** @type ResolutionCSVRow[] */
	const dataJune = (await c2j().fromFile(
		path.resolve(import.meta.dirname, "../../model-data/20240625v1.csv")
	))
	/** @type ResolutionCSVRow[] */
	const dataMay = (await c2j().fromFile(
		path.resolve(import.meta.dirname, "../../model-data/20240514v1.csv")
	))

	const data = shuffle([
		...preprocessData(dataSeptember),
		...preprocessData(dataAugust),
		...preprocessData(dataJuly),
		...preprocessData(dataJune),
		...preprocessData(dataMay),
	])
	const rawTrainingData = data.slice(0, Math.floor(0.8 * data.length))
	const rawTestData = data.slice(Math.floor(0.8 * data.length))
	const trainingData = await encodeDataset(
		rawTrainingData.map((el) => el.resolutionText)
	)
	/* map each row of training data into a list [0|1][] where the index of the
	 * expected resolution status has a value of 1 */
	const trainingOutputData = tf.tensor2d(
		rawTrainingData.map(
			(el) => Array.from(resolutions, (s) => s === el.resolutionStatus ? 1 : 0)
		)
	)
	const testData = await encodeDataset(rawTestData.map((el) => el.resolutionText))

	const model = tf.sequential()

	model.add(tf.layers.dense({
		activation: "sigmoid",
		inputShape: [trainingData.shape[1]],
		units: resolutions.length
	}))
	model.add(tf.layers.dense({
		activation: "sigmoid",
		inputShape: resolutions.length,
		units: resolutions.length
	}))
	model.add(tf.layers.dense({
		activation: "sigmoid",
		inputShape: resolutions.length,
		units: resolutions.length
	}))
	model.compile({
		loss: "meanSquaredError",
		optimizer: tf.train.adam(0.06)
	})

	await model.fit(trainingData, trainingOutputData, { epochs: 200 })

	const results = model.predict(testData)
	const resultsArray = await results.array()

	resultsArray.forEach((el, idx) => {
		const i = el.findIndex((e) => 1 - e < 0.03)

		if (rawTestData[idx].resolutionStatus === resolutions[i]) {
			console.log(rawTestData[idx].resolutionText, el[i], rawTestData[idx].resolutionStatus, `->`, resolutions[i])
		}
	})

	console.log()

	resultsArray.forEach((el, idx) => {
		const i = el.findIndex((e) => 1 - e < 0.03)

		if (i !== -1 && (rawTestData[idx].resolutionStatus !== resolutions[i])) {
			console.log(rawTestData[idx].resolutionText, el[i], rawTestData[idx].resolutionStatus, `->`, resolutions[i])
		}
	})

	await model.save(
		"file://" + path.resolve(import.meta.dirname, "./cc-resolution.model")
	)
}

go()
