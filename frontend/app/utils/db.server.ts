import {
	randomUUID
} from "node:crypto"

import {
	remember
} from '@epic-web/remember'
import sqlite from "better-sqlite3"

type WhereOpts = string[] | {
	hide?: string[];
	show?: string[]
}

type SelectKeyOpt<TableType extends object, JoinTableNamesTypes extends { [k:string]: object } = never> =
	| keyof TableType
	| `${string & keyof JoinTableNamesTypes}.${string}`

type DBQueryOpts<
	T extends object,
	U extends { [k: string]: object } = never
> = {
	conflictTarget?: string;
	join?: U extends never
		? never
		: { [k1 in keyof U]: Partial<{ [k2 in keyof U[k1]]: keyof T }> }
	limit?: number;
	offset?: number;
	select?:
		| "*"
		| (SelectKeyOpt<T, U>)[];
	omitId?: boolean;
	where?: Partial<Record<keyof U, WhereOpts> & Record<keyof U, WhereOpts>>
}

function escapeValue(value: unknown) {
	switch (typeof value) {
		case "number": {
			return value
		}
		case "string": {
			return `'${value.replaceAll("'", "''")}'`
		}
		case "boolean": {
			return !!value ? 1 : 0
		}
		default: {
			throw new Error("unhandled value type: " + typeof value)
		}
	}
}

function buildWhereClause<T extends object, U extends { [k: string]: object }>(tableName: string, opts?: DBQueryOpts<T, U>) {
	if (!opts) {
		return undefined
	}

	return Object.entries(opts?.where ?? {} as Record<string, WhereOpts>).map(
		([k, v]: [string, WhereOpts]) => {
			if (Array.isArray(v)) {
				return v.length === 1
					? `${opts?.join ? tableName + "." : ""}${k}=${escapeValue(v[0])}`
					: `${k} IN (${v.map((el) => escapeValue(el)).join(", ")})`
			}

			return [
				(!v.show || v.show.length === 0)
					? ""
					: v.show.length === 1
						? `${(opts?.join && !k.includes(".")) ? tableName + "." : ""}${k}=${escapeValue(v.show[0])}`
						: `${k} IN (${v.show.map((el) => escapeValue(el)).join(", ")})`,
				(!v.hide || v.hide.length === 0)
				? ""
					: v.hide.length === 1
						? `${(opts?.join && !k.includes(".")) ? tableName + "." : ""}${k}!=${escapeValue(v.hide[0])}`
						: `${k} NOT IN (${v.hide.map((el) => escapeValue(el)).join(", ")})`
			].filter(Boolean)
		}
	).flat().join(" AND ")
}

function buildJoinClause<T, U>(tableName: string, opts?: DBQueryOpts<T, U>) {
	if (!opts) {
		return undefined
	}

	return Object.entries(opts.join ?? {}).reduce(
		(acc, [joinTable, joins]) => {
			acc += ` INNER JOIN ${joinTable} ON `
			acc += Object.entries(joins)
				.map(([k, v]) => `${joinTable}.${k} = ${tableName}.${v} `)
				.join(" AND ") // is this right?
			return acc
		},
		""
	)
}

function buildSelectClause<T, U>(tableName: string, opts?: DBQueryOpts<T, U>) {
	// TODO: support `SELECT COUNT`
	// TODO: support table aliases e.g. `select x.y from T as x`
	if (opts?.select === undefined || opts?.select === "*") {
		return `SELECT ${tableName}.* FROM ${tableName}`
	}

	const columns = opts.select
		.map(
			(el) => String(el).includes(".")
				? el
				: `${tableName}.${String(el)}`
		)
		.join(", ")

	return `SELECT ${columns} FROM ${tableName}`
}

export const db = (() => {// remember("db", () => {
	const client = sqlite(process.env.DATABASE_PATH, { verbose: console.info })

	//client.pragma("journal_mode = WAL")

	return {
		client,
		getAll: function <T extends object, U extends { [k: string]: object } = never>(tableName: string, opts?: DBQueryOpts<T, U>) {//DBQueryOpts<Literal<typeof tableName>, T, U>) {
			const selectClause = buildSelectClause<T, U>(tableName, opts)
			const joinClause = buildJoinClause<T, U>(tableName, opts)
			const whereClause = buildWhereClause<T, U>(tableName, opts)
			const limit = opts?.limit
			const offset = opts?.offset
			console.log(`->`, opts?.where)
			return client.prepare<Partial<T>[], Partial<T>>(
				selectClause
					+ (joinClause ? ` ${joinClause}` : ``)
					+ (whereClause ? ` WHERE ${whereClause}` : ``)
					+ (limit ? ` LIMIT ${limit}` : ``)
					+ (offset !== undefined ? ` START ${offset}` : ``)
			).all()
		},
		get: function<T, U = never>(tableName: string, opts: DBQueryOpts<T, U>) {
			const columns = opts.select === undefined || opts.select === "*"
				? "*"
				: opts.select.join(",")
			const joinClause = Object.entries(opts.join ?? {}).reduce(
				(acc, [joinTable, joins]) => {
					acc += ` INNER JOIN ${joinTable} ON `
					acc += Object.entries(joins)
						.map(([k, v]) => `${joinTable}.${k} = ${tableName}.${v} `)
						.join(" AND ") // is this right?
					return acc
				},
				""
			)
			const where = Object.entries(opts.where as Record<string, unknown[]> ?? {}).map(
				([k,v]) => v.length === 1
					? `${k}=${escapeValue(v[0])}`
					: `${k} IN (${v.map((el) => escapeValue(el)).join(", ")})`
			).join("AND")

			return client.prepare<T[], T>(
				`SELECT ${columns} FROM ${tableName} `
					+ (joinClause ?? ``)
					+ `WHERE ${where} `
					+ (opts.limit !== undefined ? `LIMIT ${opts.limit}` : ` `)
					+ (opts.offset !== undefined ? `START ${opts.offset}` : ` `)
			).get()
		},
		insertOne: function<T>(tableName: string, values: Partial<T>, opts?: DBQueryOpts<T, never>) {
			const columns = Object.keys(values)
			let fieldNames = columns.join(",")
			let namedParameters = columns.map((el) => `:${el}`)
				.join(",")

			if (!("id" in values) && !opts?.omitId) {
				fieldNames += `,id`
				namedParameters += `,:id`
			}

			return client.prepare<Partial<T>[], T>(
				`INSERT INTO ${tableName} `
					+ `(${fieldNames}) VALUES (${namedParameters}) `
					+ `RETURNING *`
			).get({ id: randomUUID(), ...values })
		},
		insertMany: function<T>(tableName: string, values: (Partial<T>)[], opts?: DBQueryOpts<T, never>) {
			const columns = Object.keys(values[0])
			let fieldNames = columns.join(",")
			let namedParameters = columns.map((el) => `:${el}`)
				.join(",")

			if (!("id" in values[0]) && !opts?.omitId) {
				fieldNames += `,id`
				namedParameters += `,:id`
			}

			const stmt = client.prepare<Partial<T>[], T>(
				`INSERT INTO ${tableName} (${fieldNames}) `
					+ `VALUES (${namedParameters}) `
					+ `RETURNING *`
			)

			return values.map(
				(el) => stmt.get({ id: randomUUID(), ...el })
			)
		},
		upsert: function<T>(tableName: string, values: Partial<T>, opts?: DBQueryOpts<T, never>) {
			const columns = Object.keys(values)
			let fieldNames = columns.join(",")
			let namedParameters = [
				...columns.map((el) => `:${el}`)
			].join(",")

			if (!("id" in values) && !opts?.omitId) {
				fieldNames += `,id`
				namedParameters += `,:id`
			}

			const onConflict = opts?.conflictTarget ?? "DO NOTHING"

			return client.prepare<Partial<T>[], T>(
				`INSERT INTO ${tableName} `
					+ `(${fieldNames}) VALUES (${namedParameters}) `
					+ `ON CONFLICT ${onConflict} `
					+ `RETURNING *`
			).get({ id: randomUUID(), ...values })
		},
		upsertMany: function<T>(tableName: string, values: (Partial<T>)[], conflictTarget?: string) {
			const columns = Object.keys(values[0])
			const fieldNames = [
				"id",
				...columns
			].join(",")
			const namedParameters = [
				":id",
				...columns.map((el) => `:${el}`)
			].join(",")
			const onConflict = conflictTarget ?? "DO NOTHING"
			const stmt = client.prepare<Partial<T>[], T>(
				`INSERT INTO ${tableName} `
					+ `(${fieldNames}) VALUES (${namedParameters}) `
					+ `ON CONFLICT ${onConflict} `
					+ `RETURNING *`
			)

			return values.map(
				(el) => stmt.get({ ...el, id: randomUUID() })
			)
		}
	}
})() //
