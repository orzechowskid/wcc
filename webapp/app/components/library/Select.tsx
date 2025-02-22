import ChevronDown from "@spectrum-icons/workflow/ChevronDown"
import {
	Button,
	Label,
	ListBox,
	ListBoxItem,
	ListBoxItemProps,
	Popover,
	Select as ReactAriaSelect,
	SelectValue,
	type SelectProps as ReactAriaSelectProps
} from "react-aria-components"
import {
	styled
} from "styled-components"

type SelectProps = ReactAriaSelectProps & {
	items: Partial<ListBoxItemProps>[];
	label: string
}

const TriggerButton = styled(Button)`
		border: var(--border-input-default);
		border-radius: var(--border-radius-button-sm);
		padding: var(--padding-button-xl);
		display: flex;
		justify-content: space-between;
		align-items: stretch;
		gap: var(--spacing-button-lg);
		line-height: 1.5;
		color: var(--color-button-default);
		background-color: var(--background-color-button-default);

		svg {
				width: 16px;
				aspect-ratio: 1/1;
		}
		`

const StyledLabel = styled(Label)`
		font-size: 75%;
`

const StyledPopover = styled(Popover)`
		width: var(--trigger-width);
		padding: var(--padding-list);
		background-color: var(--background-color-list);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-list);

		[role="option"] {
				padding: var(--padding-list-item);

				&[data-hovered="true"],
				&[data-selected="true"] {
						background-color: var(--background-color-listitem-hover);
				}
		}
`

export default function Select(props: SelectProps) {
	const {
		items,
		label,
		...selectProps
	} = props

	return (
		<ReactAriaSelect
			{...selectProps}
		>
			<StyledLabel>
				{label}
			</StyledLabel>
			<TriggerButton>
				<SelectValue />
				<ChevronDown />
			</TriggerButton>
			<StyledPopover>
				<ListBox items={items}>
					{(item) => <ListBoxItem>{item.textValue}</ListBoxItem>}
				</ListBox>
			</StyledPopover>
		</ReactAriaSelect>
	)
}
