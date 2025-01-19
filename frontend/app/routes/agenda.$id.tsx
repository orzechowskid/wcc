import {
	type PressEvent
} from "@react-types/shared"
import {
	type ColumnSize
} from "@react-types/table"
import {
	json,
	type LoaderFunctionArgs
} from "@remix-run/node"
import {
	Form,
  Link,
	useLoaderData,
  useLocation,
	useSearchParams,
} from "@remix-run/react"
import _get from "lodash/get"
import _set from "lodash/set"
import {
	type HTMLAttributes,
  useCallback,
	useEffect,
	useId,
  useRef,
  useState
} from "react"
import {
	Cell,
	Collection,
	Column,
	Row,
	Table,
	TableBody,
	TableHeader,
} from "react-aria-components"
import { styled } from "styled-components"

import FilterPanel from "~/components/FilterPanel.tsx"
import Paginator from "~/components/Paginator.tsx"
import { CityCouncilAgenda } from "~/dto/db/CityCouncilAgenda.ts"
import { AgendaItem } from "~/dto/db/AgendaItem.ts"
import { Councilor } from "~/dto/db/Councilor.ts"
import { AgendaMayor } from "~/dto/db/AgendaMayor.ts"
import {
	db
} from "~/utils/db.server.ts"
import { AgendaItemAgenda } from "~/dto/db/AgendaItemAgenda"
import { AgendaItemResolution } from "~/dto/db/AgendaItemResolution"

type FilterValues = {
	hide: string[];
	show: string[]
}

type ActiveFilters<T extends object = object> = Partial<Record<
	keyof T,
	FilterValues
>>

function searchParamsToFilters<T extends object>(params: URLSearchParams) {
	return [ ...params.keys() ]
		.reduce(
			(acc, el) => {
				if (el.startsWith("filter:")) {
					const filterKey = el.slice("filter:".length)
					const filterName = filterKey.includes("resolutionStatus")
						? filterKey.replace("resolutionStatus", "AgendaItemResolution.resolutionStatus")
						: filterKey

					if (filterName.startsWith("~")) {
						_set(acc, `["${filterName.slice(1)}"].hide`, params.getAll(el))
					}
					else {
						_set(acc, `["${filterName}"].show`, params.getAll(el))
					}
				}

				return acc
			},
			{} as ActiveFilters<T>
		)
}

function remapFilterNames<T extends object>(activeFilters: ActiveFilters<T>) {
	return Object.fromEntries(Object.entries(activeFilters).map(
		([k,v]) => [
			k === "AgendaItemResolution.resolutionStatus" ? "resolutionStatus" : k,
			v
		]
	))
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	const { searchParams } = new URL(request.url)
	const filters = searchParamsToFilters<CityCouncilAgenda>(searchParams)
	console.log({filters})
	const agenda = db.get<CityCouncilAgenda>("CityCouncilAgenda", {
		where: {
			id: [ String(params.id) ]
		}
	})
	const filterCounts = {
		agendaSectionHeaders: db.client.prepare<
			Record<string, string>,
			{ val: string; num: number }
		>(
			`SELECT ai.agendaSectionHeaders as val, count(ai.agendaSectionHeaders) as num FROM AgendaItem as ai INNER JOIN AgendaItemAgenda as aia on ai.id = aia.agendaItemId WHERE aia.agendaId = :id GROUP BY val`
		).all({ id: String(params.id) }),
		resolutionStatus: db.client.prepare<
			Record<string, string>,
			{ val: string; num: number }
		>(
			`SELECT air.resolutionStatus as val, count(air.resolutionStatus) as num FROM AgendaItemResolution as air INNER JOIN AgendaItemAgenda as aia on air.agendaItemId = aia.agendaItemId where aia.agendaId = :id GROUP BY val`
		).all({ id: String(params.id) }),
	}

	type AgendaItemJoins = {
		"AgendaItemAgenda": AgendaItemAgenda;
		"AgendaItemResolution": AgendaItemResolution
	}
	const items = db.getAll<AgendaItem, AgendaItemJoins>("AgendaItem", {
		join: {
			AgendaItemAgenda: {
				agendaItemId: "id"
			},
			AgendaItemResolution: {
				agendaItemId: "id"
			}
		},
		select: [ "documentId", "id", "itemSection", "text", "AgendaItemResolution.resolutionStatus" ],
		where: filters
	})
	// const items = db.client.prepare<Partial<CityCouncilAgenda>, AgendaItem>(
	// 	`SELECT * from AgendaItem INNER JOIN AgendaItemAgenda ON AgendaItem.id = AgendaItemAgenda.agendaItemId WHERE AgendaItemAgenda.agendaId = :id`
	// ).all({ id: String(params.id) })
	const councilors = db.client.prepare<Partial<Councilor>, Councilor>(
		`SELECT id, name from Councilor INNER JOIN AgendaCouncilor ON Councilor.id = AgendaCouncilor.councilorId WHERE AgendaCouncilor.agendaId = :id`
	).all({ id: String(params.id) })
	const collator = new Intl.Collator("en", {
		ignorePunctuation: true,
		numeric: true
	})

	type MayorJoins = {
		"AgendaMayor": AgendaMayor
	}
	const mayor = db.get<Councilor, MayorJoins>("Councilor", {
		join: {
			AgendaMayor: {
				mayorId: "id"
			}
		},
		where: {
			agendaId: [ String(params.id) ]
		}
	})

	items.sort(
		(a, b) => collator.compare(String(a.itemSection), String(b.itemSection))
	)

	return json({
		agenda,
		councilors,
		filters: remapFilterNames(filters),
		filterCounts,
		items,
		mayor
	})
}

type AgendaFilterProps = HTMLAttributes<HTMLElement> & {
	activeFilters: ActiveFilters<T>;
	"aria-controls": string;
	filterCounts: {
		agendaSectionHeaders: ({ val: string; num: number })[];
		resolutionStatus: ({ val: string; num: number })[]
	};
	onChangeActiveFilters: (nextFilters: ActiveFilters<T>) => void
}

const StyledAgendaFilterForm = styled(Form)`
> div:first-child {
font-size:150%;
font-weight: 600;
}
> ul {
    overflow: hidden auto;

    > li > fieldset {
      max-height: 200px;
      overflow: hidden auto;
      scrollbar-width: thin;
    }

    > li + li {
      margin-top: 24px;
    }
  }

  :has(> [role="radiogroup"]) {
    padding: 4px;
    display: flex;
    align-items: center;
    gap: 6px;

    [role="radiogroup"] {
      flex-shrink: 0;
    }
  }
`

function AgendaFilter(props: AgendaFilterProps) {
	const {
		activeFilters,
		filterCounts,
		onChangeActiveFilters,
		...elProps
	} = props

	if (!elProps["aria-controls"]) {
		throw new Error()
	}

	const onToggleHideItem = useCallback((e: PressEvent) => {
		const filter = e.target.closest("[data-filter]")?.getAttribute("data-filter")
		const value = e.target.getAttribute("data-value")

		if (!filter || value === null) {
			throw new Error()
		}

		let hides = activeFilters[filter]?.hide ?? []
		let shows = activeFilters[filter]?.show ?? []
		const hideIdx = hides.findIndex((el) => el === value)
		const showIdx = shows.findIndex((el) => el === value)

		hides = hideIdx === -1
			? hides.concat(value)
			: hides.toSpliced(hideIdx, 1)
		shows = showIdx === -1
			? shows
			: shows.toSpliced(showIdx, 1)

		const nextActiveFilters = {
			...activeFilters,
			[filter]: {
				hide: hides,
				show: shows
			}
		}

		onChangeActiveFilters(nextActiveFilters)
	}, [activeFilters])
	const onClearFilter = useCallback((e: PressEvent) => {
		const filter = e.target.closest("[data-filter]")?.getAttribute("data-filter")

		if (!filter) {
			throw new Error()
		}

		const {
			[filter]: _removed,
			...nextActiveFilters
		} = activeFilters

		onChangeActiveFilters(nextActiveFilters)
	}, [activeFilters])
	const onToggleShowItem = useCallback((e: PressEvent) => {
		const filter = e.target.closest("[data-filter]")?.getAttribute("data-filter")
		const value = e.target.getAttribute("data-value")

		if (!filter || value === null) {
			throw new Error()
		}

		let hides = activeFilters[filter]?.hide ?? []
		let shows = activeFilters[filter]?.show ?? []
		const hideIdx = hides.findIndex((el) => el === value)
		const showIdx = shows.findIndex((el) => el === value)

		hides = hideIdx === -1
			? hides
			: hides.toSpliced(hideIdx, 1)
		shows = showIdx === -1
			? shows.concat(value)
			: shows.toSpliced(showIdx, 1)

		const nextActiveFilters = {
			...activeFilters,
			[filter]: {
				hide: hides,
				show: shows
			}
		}

		onChangeActiveFilters(nextActiveFilters)
	}, [activeFilters])

	return (
		<StyledAgendaFilterForm
			method="get"
			{...elProps}
		>
			<div>
			  Filters
			</div>
			<ul>
				<li>
					<FilterPanel
						activeFilters={activeFilters.agendaSectionHeaders ?? []}
						availableFilters={filterCounts.agendaSectionHeaders}
						label="Agenda Section"
						name="agendaSectionHeaders"
						onClearFilter={onClearFilter}
						onToggleHideItem={onToggleHideItem}
						onToggleShowItem={onToggleShowItem}
					/>
				</li>
				<li>
					<FilterPanel
						activeFilters={activeFilters.resolutionStatus ?? []}
						availableFilters={filterCounts.resolutionStatus}
						label="Resolution Status"
						name="resolutionStatus"
						onClearFilter={onClearFilter}
						onToggleHideItem={onToggleHideItem}
						onToggleShowItem={onToggleShowItem}
					/>
				</li>
			</ul>
		</StyledAgendaFilterForm>
	)
}

const StyledMain = styled.main`
  display: grid;
  grid-template-areas:
    "header header"
    "filter content";
  grid-template-rows: max-content 1fr;
  grid-template-columns: 300px 1fr;
  gap: 8px;

dt {
font-size: 110%;
font-weight: 400;
}
dd:last-child div {
display: flex;
gap: 8px;
}

  & > [slot="header"] {
grid-area: header;
color: white;
background-color: #00456e;
  }
  & > [slot="filter"] {
    grid-area: filter;
    overflow: hidden;
  }
  & > [slot="content"] {
    grid-area: content;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    & > div:first-child {
      flex-grow: 1;
      overflow:hidden;
      display:flex;
    }

    table {
      display: grid;
      grid-template-columns: max-content 1fr max-content;
      grid-template-rows: max-content;
      overflow: auto;
    }

    th, td {
      padding: 6px 3px;
    }

    thead {
      display: contents;
    }

    tr {
      display: contents;
    }

    th {
      color: white;
      background: #005689;
      position: sticky;
      top: 0;
    }

    tbody {
      display: contents;

      tr {
        display: contents;
      }

      tr:nth-child(even) td {
        background-color: #fafafa;
      }

tr:has(td:hover) td {
background-color: #eeeeee;
}
}

}

nav {
margin: 8px;
}
nav [aria-expanded] {
width: 80px;
}
`

type AgendaTableColumn = {
	isRowHeader?: true;
	defaultWidth?: ColumnSize;
	name: string;
	id: string;
	width?: ColumnSize
}
const PAGE_SIZE = 20

export default function AgendaPage() {
	const data = useLoaderData<typeof loader>()
	const {
		agenda,
		councilors,
		filters,
		filterCounts,
		items,
		mayor
	} = data
	const [currentPage, setCurrentPage] = useState<number>()
	const [records, setRecords] = useState<(typeof items)|null>(null)
	const tableRef = useRef<HTMLTableElement|null>(null)
	const location = useLocation()
	const [, setSearchParams] = useSearchParams()
	const id = useId()
	const totalPages = Math.ceil(items.length / PAGE_SIZE)
	const tableColumns: AgendaTableColumn[] = [{
		isRowHeader: true,
		name: "Agenda Item",
		id: "itemSection",
		width: 120
	}, {
		name: "Item Text",
		id: "text",
		width: "1fr"
	}, {
		name: "Resolution",
		id: "resolutionStatus",
		width: 160
	}]
	const {
		hash
	} = location
	const onChangeActiveFilters = useCallback((nextFilters: ActiveFilters<CityCouncilAgendaItemWithRelations>) => {
		setCurrentPage(0)
		setSearchParams((prev) => {
			const nextParams = new URLSearchParams(prev)

			Array.from(prev.keys()).forEach(
				(k) => nextParams.delete(k)
			)

			Object.entries(nextFilters).forEach(([k, v]) => {
				v?.hide?.forEach(
					(fv) => nextParams.append(`filter:~${k}`, fv)
				)
				v?.show?.forEach(
					(fv) => nextParams.append(`filter:${k}`, fv)
				)
			})

			console.log({nextParams: nextParams.toString()})
			return nextParams
		})
	}, [])

	useEffect(() => {
		const hashParams = new URLSearchParams(hash.slice(1) ?? "")
		const page = (+(hashParams.get("page") ?? 1) - 1)
		const cursor = page * PAGE_SIZE
		console.log({page,currentPage})
		setCurrentPage(page)
		setRecords(items.slice(cursor, cursor + PAGE_SIZE) ?? [])
		tableRef.current?.scrollTo({
			behavior: "smooth",
			top: 0
		})
	}, [currentPage, hash, items])

	return (
		<StyledMain>
			<div slot="header">
				<h1>
					City Council Agenda
						{agenda ? (
							`: ${new Date(agenda.postedAt).toISOString().split("T")[0]}`
						) : (
							null
						)}
				</h1>
				<dl>
					<dt>Mayor</dt>
					<dd>
						<span>
							{mayor ? (
								<a href={`/councilor/${mayor.id}`}>
									{mayor.name}
								</a>
							) : (
								null
							)}
						</span>
					</dd>
					<dt>Councilors</dt>
					<dd>
						<div>
							{councilors.map((el) => (
								<span key={el.id}>
									<a href={`/councilor/${el.id}`}>
										{el.name}
									</a>
								</span>
							))}
						</div>
					</dd>
				</dl>
			</div>
			<AgendaFilter
				activeFilters={filters}
				aria-controls={id}
				filterCounts={filterCounts}
				onChangeActiveFilters={onChangeActiveFilters}
				slot="filter"
			/>
			<div
				id={id}
				slot="content"
			>
				<div>
					<Table
						ref={tableRef}
						aria-label="Agenda items"
						selectionMode="none"
					>
						<TableHeader>
							<Collection items={tableColumns}>
								{(column) => {
									return (
										<Column
											isRowHeader={column.isRowHeader}
											key={column.id}
											defaultWidth={column.width}
										>
											{column.name}
										</Column>
									)}}
							</Collection>
						</TableHeader>
						<TableBody items={records ?? []}>
							{(item) => {
								return (
									<Row
										id={item.id}
									>
										<Collection items={tableColumns}>
											{(column) => {
												return (
													<Cell
													>
														{column.id === "itemSection" ? (
															<Link to={`/item/${item.documentId}`}>
																{item[column.id]}
															</Link>
														) : (
															item[column.id]
														)}
													</Cell>
												)}}
										</Collection>
									</Row>
								)
							}}
						</TableBody>
					</Table>
					{!records ? (
						<div>loading...</div>
					) : (
						null
					)}
				</div>
				{currentPage !== undefined ? (
					<Paginator
						currentPage={currentPage}
						getLinkForPage={(pageNumber) => ({
							hash: `#page=${pageNumber + 1}`,
							search: location.search
						})}
						pageSize={PAGE_SIZE}
						totalItems={items.length}
					/>
				) : (
					null
				)}
			</div>
		</StyledMain>
	)
}
