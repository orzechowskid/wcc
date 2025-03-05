export type UserRecord = {
	email_address: string;
	first_name: string;
	last_name: string;
	slug: string
}

export type AgendaRecord = {
	created_at: string; /* ISO8601 */
	meeting_date: string; /* ISO8601 */
	raw_text: string;
	slug: string
}

export type Credit = {
	creator: string;
	creatorLink: string;
	license: string;
	licenseLink: string
}
