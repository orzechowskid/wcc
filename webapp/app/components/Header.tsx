import {
	Link
} from "react-router"
import {
	styled
} from "styled-components"

const StyledHeader = styled.header`
		color: var(--color-header-text);
		background-color: var(--background-color-header);
`

export default function Header() {
	return (
		<StyledHeader>
			<nav>
				<ul>
					<li>
						<Link to="/">Home</Link>
					</li>
				</ul>
			</nav>
		</StyledHeader>
	)
}
