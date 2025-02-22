import {
	Authenticator
} from "remix-auth"
import {
	GoogleStrategy
} from "@coji/remix-auth-google"

import {
	type SessionUser
} from "./auth.server.ts"

const googleStrategy = new GoogleStrategy(
  {
    clientId: String(process.env.OAUTH_GOOGLE_CLIENT_ID),
    clientSecret: String(process.env.OAUTH_GOOGLE_CLIENT_SECRET),
    redirectURI: "https://local.host/auth/google/callback"
  },
  async ({ accessToken, tokens }) => {
		console.log({accessToken,tokens})
    // Get the user data from your DB or API using the tokens and profile
    const profile = await GoogleStrategy.userProfile(tokens)

		console.log({profile})
		return {
			id: "deadbeef",
			email: "",
			displayName: "",
			pictureUrl: ""
		}
  },
)

export const authenticator = new Authenticator<SessionUser>()
authenticator.use(googleStrategy)
