import {
	resolve
} from "node:path"

/**
 * @param {string} propertyName
 * @param {Record<string, string>} property
 */
function getColumnTypeFromSchemaType(file, propertyName, property) {
	let type = "ANY"
	let columnHints = property.columnHints ?? ""

	switch (property.type) {
		case "string": {
			type = "TEXT"
			break
		}
		case "integer":
		case "number": {
			type = "REAL"
			break
		}
		case "boolean": {
			type = "INTEGER" // booleans are not supported by sqlite
			break
		}
		default: {
			console.warn("unhandled column datatype:", schemaType)
		}
	}

	if (file.required?.includes(propertyName)) {
		columnHints += ` NOT NULL`
	}

	if (property.enum) {
		columnHints += ` CHECK( ${propertyName} IN (${property.enum.map((x) => `'${x}'`).join(" , ")}) )`
	}

	return `${type} ${columnHints}`
}

async function processFile(filePath) {
	const file = (await import(filePath, { with: { type: "json" }})).default
	const properties = Object.entries(file.properties).map(
		([k, v]) => `${k} ${getColumnTypeFromSchemaType(file, k, v)}`
	)
	let columnDefs = properties.join(" ,\n\t")

	if (file.tableHints) {
		columnDefs += ` ,\n\t${file.tableHints}`
	}

	let rc = `CREATE TABLE ${file.title}`

	rc += ` (\n\t${columnDefs}\n)\n`
	rc += `STRICT;`

	console.log(rc)
}

async function go() {
	await Promise.all(process.argv.slice(2).map((el) =>
		processFile(
			resolve(el)
		)
	))
}

go()
