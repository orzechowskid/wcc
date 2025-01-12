import {
	Avatar,
	ComboBox,
	Flex,
	type FlexProps,
	Item,
	Text,
	View
} from "@adobe/react-spectrum"
import {
	TZDate
} from "@date-fns/tz"
import { json, type MetaFunction } from "@remix-run/node"
import {
	Link,
	useLoaderData
} from "@remix-run/react"
import { useCallback, useMemo, useState } from "react"

import {
	type CityCouncilAgenda
} from "../dto/db/CityCouncilAgenda.ts"
import {
	db
} from "../utils/db.server.ts"

export const meta: MetaFunction = () => {
  return [
    { title: "WCC" },
  ]
}

export async function loader() {
	const agendaList =
		db.getAll<CityCouncilAgenda>("CityCouncilAgenda", { select: "*" })

	return json(agendaList.map(
		(el) => ({ ...el, type: "citycouncil" })
	))
}

const StackedFullWidthLayout = (props: Omit<FlexProps, "direction"|"justifyContent">) => (
	<Flex
		direction="column"
		justifyContent="stretch"
		{...props}
	/>
)

export default function Index() {
	const data = useLoaderData<typeof loader>()
	const [ inputFilter, setInputFilter ] = useState<string[]>([])
	const formattedFilteredData = useMemo(() => {
		return data.map(
			(el) => ({ ...el, postedAt: new TZDate(el.postedAt, "America/New_York").toDateString() })
		).filter(
			(el) => inputFilter.every(
				(i) => el.postedAt.toLocaleLowerCase().includes(i.toLocaleLowerCase())
			)
		)
	}, [ data, inputFilter ])
	const onInputChange = useCallback((inputValue: string) => {
		setInputFilter(inputValue.split(" "))
	}, [])

  return (
		<StackedFullWidthLayout gap="size-200">
			<View alignSelf="center">
				<ComboBox
					items={formattedFilteredData}
					label="Agenda"
					onInputChange={onInputChange}
				>
					{(item) => (
						<Item
							href={`/agenda/${item.id}`}
							textValue={item.postedAt}
						>
							<Avatar
								src="https://www.worcesterma.gov/media/template-images/city.png"
							/>
							<Text>{item.postedAt}</Text>
							<Text slot="description">{item.type}</Text>
						</Item>
					)}
				</ComboBox>
			</View>
			<View alignSelf="center">
				<Text>
					Can't find the agenda you were looking for?  <Link to="/agenda/new">Click here to request a new one</Link>!
				</Text>
			</View>
		</StackedFullWidthLayout>
  )
}
