import ChevronDown from "@spectrum-icons/workflow/ChevronDown"
import {
	Button,
	ComboBox as ReactAriaComboBox,
	ComboBoxProps as ReactAriaComboBoxProps,
	Label,
	Input,
	ListBox,
	ListBoxItem,
	Popover,
} from "react-aria-components"
import { styled } from "styled-components"

const StyledReactAriaComboBox = styled(ReactAriaComboBox)`
		display: flex;
		flex-direction: column;
		align-items: stretch;

	> div {
			border: var(--border-input-default);
			border-radius: var(--border-radius-input);
			padding: var(--padding-input);
			display: flex;
			gap: 8px;
			background-color: var(--background-color-input);

			> input {
					flex-grow: 1;
			}

		> button {
				border: 0;
				padding: 0 8px;
				display: flex;
				align-items: center;
				background: transparent;

				svg {
						width: 16px;
						aspect-ratio: 1/1;
						fill: var(--color-text-primary);
						background: transparent;
				}
		}

		> input {
				border: 0;
				padding: var(--padding-input);
				line-height: 1.5;
				color: var(--color-text-primary);
				background-color: var(--background-color-input-default);
		}
	}

	> label {
			grid-area: label;
			margin-bottom: 4px;
	}
`

const StyledListBox = styled(ListBox)`
		width: var(--trigger-width);
		box-shadow: 4px 4px 2px 3px #f8f8f8;
		padding: 2px;
		background: white;
		display: flex;
		flex-direction: column;
		gao: 2px;

		[role="option"] {
				background: #f8f8f8;

				&[data-hovered="true"],
				&[data-selected="true"] {
						background-color: #81d3ff;
				}
		}
`

// type ComboBoxProps<T extends object> =
//  ReactAriaComboBoxProps<T> & {
// 	 children: React.ReactNode | ((item: T) => React.ReactNode),
// 	 label: string
//  }

// export const Item = (props) => (
// 	<ListBoxItem {...props} />
// )

// export default function ComboBox<T extends object>(props: ComboBoxProps<T>) {
// 	const {
// 		children,
// 		label
// 	} = props

// 	return (
// 		<ReactAriaComboBox<T>>
// 			<Label>
// 				{label}
// 			</Label>
// 			<div>
// 				<Input />
// 				<Button>▼</Button>
// 			</div>
// 			<Popover>
// 				<ListBox>
// 					{children}
// 				</ListBox>
// 			</Popover>
// 		</ReactAriaComboBox>
// 	)
// }

import type {ListBoxItemProps, ValidationResult} from 'react-aria-components'
import {FieldError, Text} from 'react-aria-components'

interface MyComboBoxProps<T extends object>
  extends Omit<ReactAriaComboBoxProps<T>, 'children'> {
		label?: string
		description?: string | null
		errorMessage?: string | ((validation: ValidationResult) => string)
		children: React.ReactNode | ((item: T) => React.ReactNode)
	}

function MyComboBox<T extends object>(
  { label, description, errorMessage, children, ...props }: MyComboBoxProps<T>
) {
  return (
    <StyledReactAriaComboBox {...props}>
      <Label>{label}</Label>
      <div className="my-combobox-container">
        <Input />
        <Button>
					<ChevronDown />
				</Button>
      </div>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
      <Popover>
        <StyledListBox>
          {children}
        </StyledListBox>
      </Popover>
    </StyledReactAriaComboBox>
  )
}

function Item(props: ListBoxItemProps) {
  return (
    <ListBoxItem
      {...props}
    />
  )
}

export { Item }
export default MyComboBox
