import { type HTMLAttributes } from "react"
import {
	ToggleButton as ReactAriaToggleButton,
	ToggleButtonGroup as ReactAriaToggleButtonGroup
} from "react-aria-components"
import { styled } from "styled-components"

type ToggleButtonGroupProps = HTMLAttributes<HTMLElement>

export { ReactAriaToggleButton as ToggleButton }

const StyledToggleButtonGroup = styled(ReactAriaToggleButtonGroup)`
		button {
				border: var(--border-input-default);
				padding: var(--padding-button-sm);
				color: var(--color-button-default);
				background-color: var(--background-color-button-default);

				&[aria-pressed="true"] {
						background-color: var(--background-color-info-chip);
				}
		}

		button:first-child {
				border-top-left-radius: var(--border-radius-button-sm);
				border-bottom-left-radius: var(--border-radius-button-sm);
		}

		button:last-child {
				border-top-right-radius: var(--border-radius-button-sm);
				border-bottom-right-radius: var(--border-radius-button-sm);
		}

		button + button {
				border-left: 0;
		}
`

function ToggleButtonGroup(props: ToggleButtonGroupProps) {
	return <StyledToggleButtonGroup {...props} />
}

export { ToggleButtonGroup }
