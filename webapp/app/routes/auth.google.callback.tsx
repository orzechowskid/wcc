import {
	redirect
} from "react-router"

import {
	saveSession
} from "~/utils/auth/auth.server.ts"
import {
	authenticator,
} from "~/utils/auth/oauth-google.server.ts"
import type {
	Route
} from "./+types/auth.google.callback"

export let loader = async ({ request }: Route.LoaderArgs) => {
  const user = await authenticator.authenticate("google", request)
  const headers = await saveSession(request, user)

  return redirect("/dashboard", { headers })
}
