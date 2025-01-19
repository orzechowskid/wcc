import {
	Link
} from "@remix-run/react"
import {
	styled
} from "styled-components"

const StyledHeader = styled.header`
  color: white;
  background-color: #005689;
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
