import {
	Button,
	Calendar,
	CalendarCell,
	CalendarGrid,
	DateInput,
	DatePicker as ReactAriaDatePicker,
	type DatePickerProps as ReactAriaDatePickerProps,
	DateSegment,
	Dialog,
	Group,
	Heading,
	Label,
	Popover,
  type DateValue
} from "react-aria-components"
import {
	styled
} from "styled-components"

import Icon from "./Icon.tsx"

type DatePickerProps = ReactAriaDatePickerProps<DateValue> & {
	label: string
}

const StyledPopover = styled(Popover)`
		width: 240px;

		& table {
				width: 100%;
		}

		& tbody tr {
				
		}

		[role="gridcell"] {
				color: black;
				text-align: center;
		}
`

const StyledGroup = styled(Group)`
		border: var(--border-input-default);
		border-radius: var(--border-radius-input-sm);
		padding: var(--padding-input);
		display: flex;
		justify-content: space-between;
		gap: var(--spacing-button-lg);
		background-color: var(--background-color-button-default);

		button {
				border: 0;
				padding: 0 var(--padding-button-xl);
				display: flex;
				align-items: center;
				background-color: transparent;

				svg {
				}
		}
`

const StyledDateInput = styled(DateInput)`
		flex-grow: 1;
		padding: var(--padding-input);
		display: flex;
		gap: var(--spacing-button-lg);
		background-color: var(--background-color-input-default);
`

const StyledReactAriaDatePicker = styled(ReactAriaDatePicker)`
`

const DatePicker = (props: DatePickerProps) => {
	const {
		label,
		...rest
	} = props

	return (
		<StyledReactAriaDatePicker {...rest}>
			<Label>{label}</Label>
			<StyledGroup>
				<StyledDateInput>
					{(segment) => <DateSegment segment={segment} />}
				</StyledDateInput>
				<Button>
					<Icon name="chevron-selector-vertical" />
				</Button>
			</StyledGroup>
			<StyledPopover>
				<Dialog>
					<Calendar>
						<header>
							<Button slot="previous">◀</Button>
							<Heading />
							<Button slot="next">▶</Button>
						</header>
						<CalendarGrid>
							{(date) => <CalendarCell date={date} />}
						</CalendarGrid>
					</Calendar>
				</Dialog>
			</StyledPopover>
		</StyledReactAriaDatePicker>
	)
}

export default DatePicker
