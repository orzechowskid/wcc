import {
	PropsWithChildren
} from "react"
import {
	Button as ReactAriaButton
} from "react-aria-components"

type ButtonProps = PropsWithChildren<{
}>

function Button(props: ButtonProps) {
	return (
		<ReactAriaButton {...props} />
	)
}

export default Button
