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
import DatePicker from "~/components/library/DatePicker.tsx"

const PageContainer = styled.div`
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 48px;

		form {
				width: 35%;

				[data-auto-document-heading] {
						margin-bottom: 16px;
				}
		}
`

const StyledDatePicker = styled(DatePicker)`
		width: 240px;
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
				<StyledDatePicker
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
