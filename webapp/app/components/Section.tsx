import {
  createContext,
	useContext,
	type HTMLAttributes
} from "react"

type NumberedHeadingTag =
	| "h1"
	| "h2"
	| "h3"
	| "h4"
	| "h5"
	| "h6"

type DocumentLevelContextShape = {
	documentLevel: number
}

type SectionProps = HTMLAttributes<HTMLElement> & ({
	"data-columns"?: number
} | {
	"data-centered": true;
	"data-columns": number
})

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
	as?: NumberedHeadingTag | "div"
}

const DocumentLevelContext = createContext<DocumentLevelContextShape>({
	documentLevel: 1
})

const useDocumentLevel = () => useContext(DocumentLevelContext)

const Section = (props: SectionProps) => {
	const {
		documentLevel
	} = useDocumentLevel()

	return (
		<DocumentLevelContext.Provider value={{ documentLevel: documentLevel + 1 }}>
			<section
				data-auto-document-level="true"
				{...props}
			/>
		</DocumentLevelContext.Provider>
	)
}

const getAutoHeadingTag = (documentLevel: number) => {
	switch (documentLevel) {
		case 1:
			return "h1"
		case 2:
			return "h2"
		case 3:
			return "h3"
		case 4:
			return "h4"
		case 5:
			return "h5"
		case 6:
			return "h6"
		default:
			return "div"
	}
}

const Heading = (props: HeadingProps) => {
	const {
		as,
		...rest
	} = props
	const {
		documentLevel
	} = useDocumentLevel()
	const Tag = as ?? getAutoHeadingTag(documentLevel)

	return (
		<Tag
			data-auto-document-heading="true"
			{...rest}
		/>
	)
}

export {
	Heading,
	Section
}
