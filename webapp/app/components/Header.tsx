import {
	Link
} from "react-router"
import {
	styled
} from "styled-components"

import type {
	UserRecord
} from "~/types.ts"

type HeaderProps = {
	currentUser?: UserRecord
}

const StyledHeader = styled.header`
		display: flex;
		justify-content: space-between;
		color: var(--color-header-text);
		background-color: var(--background-color-header);
`

export default function Header(props: HeaderProps) {
	const {
		currentUser
	} = props

	return (
		<StyledHeader>
			<nav>
				<ul>
					<li>
						<Link to="/">Home</Link>
					</li>
				</ul>
			</nav>
			{currentUser ? (
				<Link to="/logout">log out</Link>
			) : (
				<Link to="/login">log in</Link>
			)}
		</StyledHeader>
	)
}
