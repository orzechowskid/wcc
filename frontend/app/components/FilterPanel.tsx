import Add from "@spectrum-icons/workflow/Add"
import Close from "@spectrum-icons/workflow/CloseCircle"
import Remove from "@spectrum-icons/workflow/Remove"
import {
	type PressEvent,
	Button
} from "react-aria-components"
import { styled } from "styled-components"

import {
	ToggleButton,
	ToggleButtonGroup
} from "./library/ToggleButton.tsx"

type FilterPanelProps = {
	activeFilters: string[] | {
		hide: string[];
		show: string[]
	};
	availableFilters: { val: string; num: number }[];
	label: string;
	name: string;
	onClearFilter: (e: PressEvent) => void;
	onToggleHideItem: (e: PressEvent) => void;
	onToggleShowItem: (e: PressEvent) => void
}

const StyledFilterPanel = styled.fieldset`
margin-top: 8px;
border: 0;
border-top: 1px solid #a0a0a0;
`

const FilterLabel = styled.legend`
border: 0;
padding-top: 8px;
font-size: 120%;
display: flex;
gap: 6px;
padding: 0 8px 0 4px;
background-color: white;
font-size: 120%;
> small {
position: relative;
bottom: 8px;
height: 16px;
border-radius: 10px;
padding: 10px 0 10px 10px;
display: inline-flex;
justify-content: center;
align-items: center;
gap: 10px;
color: #444444;
background-color: #81d3ff;
box-shadow: 3px 3px 8px 0 rgba(0, 0, 0, 0.125);
font-size: 75%;

button {
border: 0;
padding: 4px;
display: flex;
justify-content: center;
align-items: center;
color: #444444;
background: transparent;
line-height: 1;

&[data-hovered="true"] {
color: white;
}

svg {
width: 16px;
}
}
}
`

const FilterItems = styled.ol`
  > li + li {
    margin-top: 8px;
}

button {
padding: 7px;
display: inline-flex;
justify-content: center;
align-items: center;
}
svg {
width: 16px;
}
`

function FilterPanel(props: FilterPanelProps) {
	const {
		activeFilters,
		availableFilters,
		label,
		name,
		onClearFilter,
		onToggleHideItem,
		onToggleShowItem
	} = props
	const filters = {
		hide: "hide" in activeFilters ? activeFilters.hide : [],
		show: "show" in activeFilters
			? activeFilters.show
			: Array.isArray(activeFilters)
				? activeFilters
				: []
	}
	const activeFilterCount = [ ...filters.hide, ...filters.show ].length

	return (
		<StyledFilterPanel
			data-filter={name}
		>
			<FilterLabel slot="label">
				{label}
				{!!activeFilterCount ? (
					<small>
						{`${activeFilterCount} applied`}
						<Button
							aria-label="Clear this filter"
							onPress={onClearFilter}
						>
							<Close />
						</Button>
					</small>
				) : (
					null
				)}
			</FilterLabel>
			<FilterItems slot="items">
				{availableFilters.map(({ val, num }) => (
					<li key={val}>
						<ToggleButtonGroup>
							<ToggleButton
								aria-label="hide all items matching this filter"
								data-value={val}
								isSelected={filters.hide.includes(val)}
								onPress={onToggleHideItem}
							>
								<Remove />
							</ToggleButton>
							<ToggleButton
								aria-label="show only items matching this filter"
								data-value={val}
								isSelected={filters.show.includes(val)}
								onPress={onToggleShowItem}
							>
								<Add />
							</ToggleButton>
						</ToggleButtonGroup>
						<div>
							{`${val} (${num})`}
						</div>
					</li>
				))}
			</FilterItems>
		</StyledFilterPanel>
	)
}

export default FilterPanel
