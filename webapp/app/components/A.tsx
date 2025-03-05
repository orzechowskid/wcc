import {
	Link,
	type LinkProps as ReactRouterLinkProps
} from "react-router"

type LinkProps = Omit<ReactRouterLinkProps, "to"> & {
	href: ReactRouterLinkProps["to"]
}

const A = (props: LinkProps) => {
	const {
		href,
		...rest
	} = props

	return (
		<Link
			to={href}
			{...rest}
		/>
	)
}

export default A
