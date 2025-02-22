import { renderToString } from "react-dom/server"
import {
  EntryContext,
	ServerRouter
} from "react-router"
import { ServerStyleSheet } from "styled-components"

export default function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	reactRouterContext: EntryContext
) {
	return new Promise((resolve, reject) => {
		const sheet = new ServerStyleSheet()
		let markup = renderToString(
			sheet.collectStyles(
				<ServerRouter
					context={reactRouterContext}
					url={request.url}
				/>
			))

		markup = markup.replace("__STYLES__", sheet.getStyleTags())

		responseHeaders.set("Content-Type", "text/html")
		resolve(new Response("<!DOCTYPE html>" + markup, {
			headers: responseHeaders,
			status: responseStatusCode
		}))
	})
}
