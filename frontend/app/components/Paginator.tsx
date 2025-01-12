import {
	type Key,
	Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue
} from "react-aria-components"
import { Link, Path } from "@remix-run/react"
import {
	type PropsWithChildren,
	useMemo
} from "react"
import { styled } from "styled-components"

const PaginatorContainer = styled.div`
display: flex;
align-items: flex-end;
gap: 8px;
`;

type PaginatorPropsBase = {
	currentPage: number;
	pageSize: number;
	totalItems: number
}

type PaginatorPropsForNav = {
	getLinkForPage: (page: number) => (string | Partial<Path>)
} & PaginatorPropsBase

type PaginatorPropsForControlled = {
	"aria-controls": string;
	onChangePage: (nextPage: number, newPageIndices: [number, number]) => void
} & PaginatorPropsBase

type PaginatorProps = PaginatorPropsForNav | PaginatorPropsForControlled

// 			<Button
// 				elementType="a"
// 				isDisabled={isMaxPage}
// 				variant="secondary"
// 			>

function usePaginator(props: PaginatorProps) {
	const {
		currentPage,
		pageSize,
		totalItems
	} = props
	const getLinkForPage = "getLinkForPage" in props ? props.getLinkForPage : undefined
	const ariaControls = "aria-controls" in props ? props["aria-controls"] : undefined
	const onChangePage = "onChangePage" in props ? props.onChangePage : undefined
	const pageRange: [number, number] = [
		0,
		!totalItems ? 0 : Math.ceil(totalItems / pageSize)
	]
	const [ , lastPage ] = pageRange
	const onSelectionChange = useMemo(() =>
		!!onChangePage ? (key: Key | null) => {
			console.log(key)
		} : undefined,
		[onChangePage]
	)
	const items = useMemo(() =>
		new Array(lastPage).fill(null).map((_, idx) => ({
			id: idx,
			name: idx,
			href: (!!getLinkForPage && (idx !== currentPage))
				? getLinkForPage(idx)
				: undefined,
			textValue: String(idx + 1)
		})),
		[currentPage, getLinkForPage, lastPage]
	)
	const {
		firstPageControl,
		lastPageControl,
		nextPageControl,
		prevPageControl
	} = useMemo(() => {
		const isMaxPage = currentPage === lastPage - 1
		const isMinPage = currentPage === 0
		const useLink = !!getLinkForPage

		return {
			firstPageControl: useLink ? (
				<NavLink
					disabled={isMinPage}
					href={getLinkForPage(0)}
				>
					 first
				</NavLink>
			) : (
				<NavButton
					onSelectionChange={onSelectionChange}
				>
					 first
				</NavButton>
			),
			lastPageControl: useLink ? (
				<NavLink
					disabled={isMaxPage}
					href={getLinkForPage(lastPage - 1)}
				>
					 last
				</NavLink>
			) : (
				<NavButton
					onSelectionChange={onSelectionChange}
				>
					 last
				</NavButton>
			),
			nextPageControl: useLink ? (
				<NavLink
					disabled={isMaxPage}
					href={getLinkForPage(currentPage + 1)}
				>
					 next
				</NavLink>
			) : (
				<NavButton
					onSelectionChange={onSelectionChange}
				>
					 next
				</NavButton>
			),
			prevPageControl: useLink ? (
				<NavLink
					disabled={isMinPage}
					href={getLinkForPage(currentPage - 1)}
				>
					 previous
				</NavLink>
			) : (
				<NavButton
					onSelectionChange={onSelectionChange}
				>
					 previous
				</NavButton>
			),
		}
	}, [currentPage, getLinkForPage, lastPage, onSelectionChange])

	return {
		boxProps: { "aria-controls": ariaControls },
		currentPage,
		firstPageControl,
		items,
		lastPageControl,
		nextPageControl,
		onSelectionChange,
		prevPageControl
	}
}

type NavLinkProps = PropsWithChildren<{
	disabled: boolean;
	href: string | Partial<Path>
}>

function NavLink(props: NavLinkProps) {
	const {
		children,
		disabled,
		href
	} = props

	return disabled ? (
		<a role="link" aria-disabled="true">{children}</a>
	) : (
		<Link to={href}>
			{children}
		</Link>
	)
}

type NavButtonProps = PropsWithChildren<{
	disabled: boolean;
	onSelectionChange: (key: Key | null) => void
}>

function NavButton(props: NavButtonProps) {
	const {
		children
	} = props

	return (
		<Button
		>
			{children}
		</Button>
	)
}

export default function Paginator(props: PaginatorProps) {
	const {
		boxProps,
		currentPage,
		firstPageControl,
		items,
		lastPageControl,
		nextPageControl,
		onSelectionChange,
		prevPageControl
	} = usePaginator(props)


	return (
		<PaginatorContainer>
			{firstPageControl}
			{prevPageControl}
			<Select
				selectedKey={currentPage}
				onSelectionChange={onSelectionChange}
				{...boxProps}
			>
				<Label>page</Label>
				<Button>
					<SelectValue />
				</Button>
				<Popover>
					<ListBox items={items}>
						{(item) => <ListBoxItem>{item.textValue}</ListBoxItem>}
					</ListBox>
				</Popover>
			</Select>
			{nextPageControl}
			{lastPageControl}
		</PaginatorContainer>
	)
}
