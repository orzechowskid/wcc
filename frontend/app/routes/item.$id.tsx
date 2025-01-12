import { Text } from "@adobe/react-spectrum"
import {
  json,
	type LoaderFunctionArgs
} from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { AgendaItem } from "~/dto/db/AgendaItem"
import { AgendaItemAgenda } from "~/dto/db/AgendaItemAgenda"
import { CityCouncilAgenda } from "~/dto/db/CityCouncilAgenda"

import {
	db,
	type DBQueryOpts
} from "~/utils/db.server.ts"

export async function loader({ request, params }: LoaderFunctionArgs) {
	const agendaItems = db.getAll<AgendaItem>("AgendaItem", {
		where: {
			documentId: [ String(params.id) ]
		}
	})
	const agendas = db.getAll<CityCouncilAgenda, AgendaItemAgenda>("CityCouncilAgenda", {
		join: {
			AgendaItemAgenda: {
				agendaId: "id"
			}
		},
		select: [ "id", "postedAt" ],
		where: {
			agendaItemId: agendaItems.map((el) => String(el.id))
		}
	})

	agendas.sort(
		(a, b) => (a.postedAt ?? 0) - (b.postedAt ?? 0)
	)

	return json({
		agendaItems,
		agendas
	})
}

type AgendaForItemProps = {
	id: string;
	postedAt: number
}

const AgendaForItem = (props: AgendaForItemProps) => {
	const {
		id,
		postedAt
	} = props
	const datestamp = new Date(postedAt).toISOString().split("T")[0]

	return (
		<div>
			<a href={`/agenda/${id}`}>
				{datestamp}
			</a>
		</div>
	)
}

export default function AgendaItemPage() {
	const data = useLoaderData<typeof loader>()
	const {
		agendaItem,
		agendas
	} = data

	return (
		<main>
			<h1>{agendaItem?.documentId}</h1>
			<section>
				<h2>Agendas</h2>
				{agendas?.map((agenda) => (
					<AgendaForItem
						key={agenda.id}
						id={String(agenda.id)}
						postedAt={Number(agenda.postedAt)}
					/>
				))}
			</section>
		</main>
	)
}
