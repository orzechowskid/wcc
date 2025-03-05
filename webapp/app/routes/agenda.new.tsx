import {
	now
} from "@internationalized/date"
import {
	useFetcher
} from "react-router"
import {
	styled
} from "styled-components"

import Hero from "~/components/Hero.tsx"
import Button from "~/components/library/Button.tsx"

const PageContainer = styled.div`
`

export default function NewAgenda() {
	const fetcher = useFetcher()

	return (
		<PageContainer>
			<Hero
				image="bancroftTower"
				title="New Agenda Request"
			/>
			<fetcher.Form
				id="new-agenda"
				method="POST"
			>
				<DatePicker
					granularity="day"
					label="Meeting Date"
					name="agendaDate"
					placeholderValue={now("America/New_York")}
				/>
				<Button type="submit">
					 Submit
				</Button>
			</fetcher.Form>
		</PageContainer>
	)
}
