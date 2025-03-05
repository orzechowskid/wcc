import type {
	UserRecord
} from "~/types.ts"
import {
	expandInsertQuery,
	expandSelectQuery,
	runQuery
} from "./db.server.ts"

export async function getUser(query: Partial<UserRecord>): Promise<UserRecord|undefined> {
	const [
		predicate,
		values
	] = expandSelectQuery(query)
	const result = await runQuery<UserRecord>(
		`SELECT * from app.users WHERE ${predicate}`, values
	)

	return result[0]
}

export async function createUser(query: Partial<UserRecord>): Promise<UserRecord> {
	const [
		columns,
		interpolationTokens,
		values
	] = expandInsertQuery(query)
	const result = await runQuery<UserRecord>(
		`INSERT INTO app.users(${columns}) VALUES(${interpolationTokens})`,
		values
	)

	return result[0]
}
