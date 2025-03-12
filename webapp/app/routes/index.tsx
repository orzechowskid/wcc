import {
	TZDate
} from "@date-fns/tz"
import {
	useCallback,
	useMemo,
	useState
} from "react"
import {
  Link,
	useLoaderData
} from "react-router"
import {
	styled
} from "styled-components"

import {
	type Route
} from "./+types/index"
import A from "~/components/A.tsx"
import PageHeading from "~/components/PageHeading.tsx"
import {
	Heading,
  Section
} from "~/components/Section.tsx"
import ComboBox, {
	Item
} from "~/components/library/ComboBox.tsx"
import {
	getAllAgendas
} from "~/utils/db/agendas.server.ts"
import Hero from "~/components/Hero.tsx"
import {
	center,
	leftAlign,
	rightAlign,
	hero
} from "~/components/layouts.tsx"

export async function loader() {
	return getAllAgendas()
}

const PageContainer = styled.main`
		& h2 {
				font-size: var(--font-size-3);
		}
`

const SearchSection = styled(Section)`
		display: flex;
		flex-direction: column;
		align-items: center;
`

export default function Index(props: Route.LoaderArgs) {
	const {
		loaderData
	} = props
	const [ inputFilter, setInputFilter ] = useState<string[]>([])
	const onInputChange = useCallback((inputValue: string) => {
		setInputFilter(inputValue.split(" "))
	}, [])
	const formattedFilteredData = useMemo(() => {
		return loaderData.map(
			(el) => ({ ...el, meeting_date: new TZDate(el.meeting_date, "America/New_York").toDateString() })
		).filter(
			(el) => inputFilter.every(
				(i) => el.postedAt.toLocaleLowerCase().includes(i.toLocaleLowerCase())
			)
		)
	}, [ loaderData, inputFilter ])

	return (
		<PageContainer>
			<Hero
				image="cityhall"
				title="Worcester City Council Explorer"
			/>
			<SearchSection>
				<Heading>Search agenda date</Heading>
				<ComboBox
					items={formattedFilteredData}
					label="Agenda"
				>
					{(item) => (
						<Item
							href={`/agenda/${item.slug}`}
							textValue={item.meeting_date}
						>
							<img src="" />
							<span>{item.meeting_date}</span>
							<span>{item.agenda_type}</span>
						</Item>
					)}
				</ComboBox>
				<span>Can't find the agenda you're looking for?  <A href="/agenda/new">Request it here</A>.</span>
			</SearchSection>
			<SearchSection>
				<Heading>Search councilor</Heading>
				<div>coming soon!</div>
			</SearchSection>
		</PageContainer>
	)
}
