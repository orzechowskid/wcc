import {
	styled
} from "styled-components"

import {
	Heading,
	type HeadingProps
} from "~/components/Section.tsx"

const StyledHeading = styled(Heading)`
		font-family: var(--font-family-headline);
		font-size: var(--font-size-page-title);
		font-weight: var(--font-weight-page-title);
`

export default function PageHeading(props: HeadingProps) {
	return (
		<StyledHeading {...props} />
	)
}
