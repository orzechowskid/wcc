import {
	startTransition,
	StrictMode
} from "react"
import {
	hydrateRoot
} from "react-dom/client"
import {
	HydratedRouter
	/* @ts-expect-error -- https://github.com/remix-run/react-router/issues/12371 */
} from "react-router/dom"

startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<HydratedRouter />
		</StrictMode>
	)
})
