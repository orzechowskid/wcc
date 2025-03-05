import pg, { type QueryResultRow } from "pg"

const {
	Pool
} = pg

const pool = new Pool({
	connectionString: process.env.POSTGRES_CONNECTION_STRING
})

function expandSelectQuery(obj: Record<string, unknown>): [string, string[]] {
	const x = Object.entries(obj).reduce<[string[], string[]]>(
		(acc, [k,v], idx) => {
			acc[0].push(`${k} = $${idx + 1}`)
			acc[1].push(String(v))

			return acc
		},
		[[], []]
	)

	return [
		x[0].join(" AND "),
		x[1]
	]
}

function expandInsertQuery(obj: Record<string, unknown>): [string, string, string[]] {
	const x = Object.entries(obj).reduce<[string[], string[], string[]]>(
		(acc, [k, v], idx) => {
			acc[0].push(k)
			acc[1].push(`${idx}`)
			acc[2].push(String(v))

			return acc
		},
		[[], [], []]
	)

	return [
		x[0].join(", "),
		x[1].join(", "),
		x[2]
	]
}

async function runQuery<T extends QueryResultRow>(queryString: string, values?: string[]) {
	const result = await pool.query<T>(queryString, values)

	return result.rows
}

export {
	expandInsertQuery,
	expandSelectQuery,
	runQuery
}
