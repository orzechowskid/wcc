import {
  Input,
  Label,
	TextField,
	type TextFieldProps
} from "react-aria-components"
import {
	styled
} from "styled-components"

const StyledTextField = styled(TextField)`
		display: flex;
		flex-direction: column;
		gap: var(--spacing-input);

		& > input {
				align-self: stretch;
				border: var(--border-input-default);
				border-radius: var(--border-radius-input-sm);
				padding: var(--padding-input);
				background-color: var(--background-color-input-default);
				letter-spacing: 1px;

				&::placeholder {
						color: var(--color-input-placeholder);
				}

				&:focus-visible {
						outline: 3px solid var(--outline-color-button-default);
						outline-offset: 3px;
				}
		}
`

type TextInputProps = TextFieldProps & {
	label: string,
	placeholder: string
}

export function TextInput(props: TextInputProps) {
	const {
		label,
		...rest
	} = props

	return (
		<StyledTextField {...rest}>
			<Label>{label}</Label>
			<Input />
		</StyledTextField>
	)
}

const StyledPasswordField = styled(StyledTextField)`
		& input {
				letter-spacing: 1.5px;
		}
`

export function PasswordInput(props: TextInputProps) {
	const {
		label,
		...rest
	} = props

	return (
		<StyledPasswordField {...rest}>
			<Label>{label}</Label>
			<Input />
		</StyledPasswordField>
	)
}
