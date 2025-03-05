import {
	type SVGAttributes
} from "react"
import {
	styled
} from "styled-components"

type IconProps = SVGAttributes<SVGElement> & {
	name: string
}

const StyledIcon = styled.svg`
		width:1.5em;
		height:1.5em;
`

const Icon = (props: IconProps) => {
	const {
		name,
		...rest
	} = props

	return (
		<StyledIcon
			aria-hidden="true"
			data-icon="true"
			{...rest}
		>
			<use href={`/assets/sprites.svg#${name}`} />
		</StyledIcon>
	)
}

export default Icon
