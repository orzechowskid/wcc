import type {
	AgendaRecord
} from "~/types.ts"
import {
	expandInsertQuery,
	expandSelectQuery,
	runQuery
} from "./db.server.ts"

export async function getAllAgendas(): Promise<AgendaRecord[]> {
	return runQuery<AgendaRecord>(
		`SELECT * from muni.agendas`
	)
}

export async function getAgenda(query: Partial<AgendaRecord>): Promise<AgendaRecord|undefined> {
	const [
		predicate,
		values
	] = expandSelectQuery(query)
	const result = await runQuery<AgendaRecord>(
		`SELECT * from muni.agendas WHERE ${predicate}`, values
	)

	return result[0]
}

export async function createAgenda(query: Partial<AgendaRecord>): Promise<AgendaRecord> {
	const [
		columns,
		interpolationTokens,
		values
	] = expandInsertQuery(query)
	const result = await runQuery<AgendaRecord>(
		`INSERT INTO muni.agendas(${columns}) VALUES(${interpolationTokens})`,
		values
	)

	return result[0]
}
