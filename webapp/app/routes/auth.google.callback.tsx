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
import { getUser } from "~/utils/db/users.server"

export let loader = async ({ request }: Route.LoaderArgs) => {
  const user = await authenticator.authenticate("google", request)
  const headers = await saveSession(request, user)

	console.log({user,headers})

  return redirect("/dashboard", { headers })
}
