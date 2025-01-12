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
border: 1px solid #d0d0d0;
padding: 2px;
&[aria-pressed="true"]:first-child {
background: #81d3ff;
color: #383838;
}
&[aria-pressed="true"]:last-child {
background: #a3d069;
color: black;
background: #81d3ff;
color: #383838;
}
}
button:first-child {
border-top-left-radius: 6px;
border-bottom-left-radius: 6px;
}
button:last-child {
border-top-right-radius: 6px;
border-bottom-right-radius: 6px;
}
button + button {
border-left: 0;
}
	`

function ToggleButtonGroup(props: ToggleButtonGroupProps) {
	return <StyledToggleButtonGroup {...props} />
}

export { ToggleButtonGroup }
