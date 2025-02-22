import postgres from "postgres"

const sql = postgres(String(process.env.POSTGRES_CONNECTION_STRING), {
	password: process.env.POSTGRES_PASSWORD,
	username: process.env.POSTGRES_USERNAME
})

export default sql
