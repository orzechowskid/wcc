import fs from "node:fs"

import {
  Button,
  DatePicker,
} from "@adobe/react-spectrum"
import {
	TZDate
} from "@date-fns/tz"
import {
	now
} from "@internationalized/date"
import {
	type ActionFunctionArgs
} from "@remix-run/node"
import {
	Form
} from "@remix-run/react"

import {
	db
} from "../utils/db.server.ts"
import {
	getAgendaItems,
	getCouncilors,
	getDate,
	getDocumentVersion,
	getMayor,
	processDocument
} from "../utils/scraper.server.ts"
import { Councilor } from "~/dto/db/Councilor.ts"
import { CityCouncilAgenda } from "~/dto/db/CityCouncilAgenda.ts"
import { AgendaMayor } from "~/dto/db/AgendaMayor.ts"
import { AgendaItem } from "~/dto/db/AgendaItem.ts"
import { AgendaItemResolution } from "~/dto/db/AgendaItemResolution.ts"
import { AgendaItemAgenda } from "~/dto/db/AgendaItemAgenda.ts"

const AGENDA_LOCATION_BASE = "https://www.worcesterma.gov/agendas-minutes/city-council"
const PREDICTION_SERVICE_URL_BASE = "http://localhost:8101/api/cc-item-resolution"

async function predictResolution(text: string) {
	try {
		const item = encodeURIComponent(text)
		const response = await fetch(`${PREDICTION_SERVICE_URL_BASE}/${item}`)
		return response.json() as Promise<{
			model: string;
			modelVersion: number;
			result: string
		}>
	}
	catch (ex) {
		console.error(ex)
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	console.log(formData)
	const date = new TZDate(
		`${formData.get("agendaDate")}T00:00:00`,
		"America/New_York"
	)
	const rawDocument = fs.readFileSync("/home/dan/repos/wcc/_frontend/tests/fixtures/documents/City of Worcester Council Journal for 08_27_2024.htm").toString()

	const doc = await processDocument(rawDocument)
	const version = getDocumentVersion(doc)
	const mayor = getMayor(doc, version)
	const councilors = getCouncilors(doc, version)
	const agendaItems = getAgendaItems(doc, version)
	const meetingDate = getDate(doc, version)

	const agendaId = db.insertOne<CityCouncilAgenda>("CityCouncilAgenda", {
		createdAt: Date.now(),
		postedAt: meetingDate.getTime(),
		text: rawDocument
	})?.id
	const mayorId = db.upsert<Councilor>("Councilor", mayor)?.id
	const councilorRecords = db.upsertMany<Councilor>("Councilor", [
		...councilors
	])
	db.insertOne<AgendaMayor>("AgendaMayor", {
		agendaId,
		mayorId
	}, {
		omitId: true
	})
	db.insertMany<AgendaCouncilor>(
		"AgendaCouncilor",
		councilorRecords.map((el) => ({
			agendaId,
			councilorId: el?.id
		})), {
			omitId: true
		}
	)

	const agendaItemRecords = db.insertMany<AgendaItem>(
		"AgendaItem",
		agendaItems.map((el) => ({
			agendaSectionHeaders: el.sections.join("::"),
			attachmentUrl: el.attachmentUrl,
			createdAt: Date.now(),
			documentId: el.documentId,
			itemSection: el.itemId,
			resolutionText: el.resolutionText,
			text: el.text
		}))
	)

	db.insertMany<AgendaItemAgenda>(
		"AgendaItemAgenda",
		agendaItemRecords.map((el) => ({
			agendaId,
			agendaItemId: String(el?.id)
		})),
		{ omitId: true }
	)

	/* run this in the background so we don't hold up the response with lots of
	 * async data requests to the ML model service */
	setTimeout(async () => {
		await Promise.all(agendaItemRecords.map(async (el) => {
			if (!el?.resolutionText) {
				return
			}

			const resolution = await predictResolution(el?.resolutionText)

			if (resolution) {
				const r = db.insertOne<AgendaItemResolution>("AgendaItemResolution", {
					agendaItemId: el.id,
					modelId: resolution.modelVersion,
					resolutionStatus: resolution.result
				})
				console.log(r)
			}
		}))
	}, 0)

	return new Response(JSON.stringify({}), {
		status: 201,
		headers: {
			"Content-Type": "application/json"
		}
	})
}

export default function NewAgendaPage() {
	return (
		<Form
			id="new-agenda"
			method="POST"
		>
			<DatePicker
				granularity="day"
				label="Meeting Date"
				name="agendaDate"
				placeholderValue={now("America/New_York")}
			/>
			<Button
				style="outline"
				type="submit"
				variant="primary"
			>
				Submit
			</Button>
		</Form>
	)
}
