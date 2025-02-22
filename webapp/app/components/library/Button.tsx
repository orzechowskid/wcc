import {
	Button as ReactAriaButton,
	type ButtonProps as ReactAriaButtonProps
} from "react-aria-components"
import {
	styled
} from "styled-components"

const StyledReactAriaButton = styled(ReactAriaButton)`
		border: var(--border-input-default);
		border-radius: var(--border-radius-button-sm);
		padding: var(--padding-button-xl);
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
		line-height: 1.5;
		color: var(--color-button-default);
		background-color: var(--background-color-button-default);

		&:focus-visible {
				outline: 3px solid var(--outline-color-button-default);
				outline-offset: 3px;
		}

		&:hover {
				background-color: var(--background-color-button-default-hover);
		}

		&:active {
				background-color: var(--background-color-button-default-active);
		}
`

function Button(props: ReactAriaButtonProps) {
	return (
		<StyledReactAriaButton {...props} />
	)
}

export default Button
