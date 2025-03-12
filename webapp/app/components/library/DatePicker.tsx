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
		width: clamp(320px, var(--trigger-width), 99vw);
		border: var(--border-overlay);
		padding: var(--padding-date-picker-overlay);
		background: var(--background-color-date-picker-overlay);

		header {
				display: flex;
				justify-content: space-between;
				align-items: center;

				h2 {
						font-size: var(--font-size-0);
				}

				button {
						border: 0;
						padding: var(--padding-date-picker-heading-button);
						background: transparent;
				}
		}

		& table {
				width: 100%;
				font-size: var(--font-size--1);
		}

		& tbody tr {
				
		}

		[role="gridcell"] {
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

		&[data-focus-within="true"][data-invalid="true"] {
				border-color: var(--color-input-error);
		}

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
			<Label>
				{label}
				{props.isRequired ? (
					<span>*</span>
				) : (
					null
				)}
			</Label>
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
