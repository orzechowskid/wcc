import {
	now
} from "@internationalized/date"
import {
	Form
} from "react-router"
import {
	styled
} from "styled-components"

import Hero from "~/components/Hero.tsx"
import Button from "~/components/library/Button.tsx"
import DatePicker from "~/components/library/DatePicker.tsx"
import type {
	Route
} from "./+types/agenda.new.ts"
import {
	getAgendaDocument
} from "~/services/scrape.server.ts"

export async function action(args: Route.ActionArgs) {
	const {
		request
	} = args
	const formData = await request.formData()
	const agendaDate = formData.get("agendaDate")

	if (!agendaDate) {
		throw new Error("no agenda date provided")
	}

	const agendaDocument = await getAgendaDocument(new Date(String(agendaDate)))

	console.log({ ...agendaDocument, agendaItems: agendaDocument.agendaItems.slice(0, 3)})

	return agendaDocument
}

const PageContainer = styled.main`
		form {
				justify-self: center;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: stretch;
				gap: 16px;
		}
`

const StyledDatePicker = styled(DatePicker)`
		width: 240px;
`

export default function NewAgenda(props: Route.ComponentProps) {
	const {
		actionData
	} = props

	console.log(props)

	return (
		<PageContainer>
			<Hero
				image="bancroftTower"
				title="New Agenda Request"
			/>
			<p>
					 Use this form to request that a new agenda be added to our database.  After you submit your request, and after the request is reviewed and approved, it should only take a few minutes before the requested agenda is in our database.
			</p>
			<p>
					 You may notice that some agenda items don't have a resolution attached to them.  That means our system could not determine from scanning the agenda minutes what exactly happened as a result of this agenda item.  You can help us improve by submitting a change request to add the missing resolution (thank you in advance!), or by contacting us to request we re-scan and re-add resolutions for this item's agenda.
			</p>
			<p>
					 Currently only Worcester City Council agenda minutes are supported; City Council pre-meeting agendas, as well as subcommittee agendas, are not yet able to be scanned.
			</p>
			<Form
				id="new-agenda"
				method="POST"
			>
				<StyledDatePicker
					granularity="day"
					label="Meeting Date"
					name="agendaDate"
					placeholderValue={now("America/New_York")}
					isRequired
				/>
				<Button type="submit">
					 Submit
				</Button>
			</Form>
		</PageContainer>
	)
}
