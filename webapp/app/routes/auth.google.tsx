import {
	authenticator
} from "~/utils/auth/oauth-google.server.ts"
import type {
	Route
} from './+types/auth.google'

export const loader = async ({ request }: Route.LoaderArgs) => {
  return await authenticator.authenticate('google', request)
}
