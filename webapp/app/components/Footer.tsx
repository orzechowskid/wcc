import {
	createContext,
	useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction
} from "react"
import {
	styled
} from "styled-components"

import type {
	Credit
} from "~/types.ts"

type FooterContextShape = {
	credits: Record<string, Credit>;
	setCredits: Dispatch<SetStateAction<Record<string, Credit>>>
}

const FooterContext = createContext<FooterContextShape>({
	credits: {},
	setCredits() {}
})

function FooterProvider(props: { children: ReactNode }) {
	const {
		children
	} = props
	const [ credits, setCredits ] = useState<Record<string, Credit>>({})

	return (
		<FooterContext.Provider value={{ credits, setCredits }}>
			{children}
		</FooterContext.Provider>
	)
}

const useFooter = () => useContext(FooterContext)

const Credit = styled.span`
		display: flex;
		gap: 0.5em;

		& + & {
				margin-left: var(--spacing-list-horizontal);
		}
`

function Footer() {
	const {
		credits,
	} = useFooter()

	return (
		<footer>
			{Object.entries(credits).map(([k,v]) => (
				<Credit key={k}>
					<span>{k}:</span>
					<a href={v.creatorLink}>{v.creator}</a>
					<span>({v.license})</span>
				</Credit>
			))}
		</footer>
	)
}

export {
	Footer,
	FooterProvider,
	useFooter
}
